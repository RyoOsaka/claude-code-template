---
paths:
  - "infrastructure/**"
  - "**/*.tf"
  - "**/*.tfvars"
---

# Terraform インフラガイドライン

## 基本方針

- HashiCorp 公式スタイルガイドに準拠する
- `terraform fmt` / `terraform validate` をコミット前に必ず実行する
- モジュール分割で再利用性を確保し、環境ごとに state を分離する
- 1 state あたりリソース 100 以下（理想は数十）を目安にする

## ディレクトリ構成

```
infrastructure/
├── environments/              # 環境別ルート設定
│   ├── dev/
│   │   ├── main.tf            # モジュール呼び出し
│   │   ├── backend.tf         # リモートバックエンド設定
│   │   ├── variables.tf       # 環境固有の変数宣言
│   │   ├── terraform.tfvars   # 環境固有の変数値（git 管理外）
│   │   └── outputs.tf
│   ├── staging/
│   └── prod/
├── modules/                   # 再利用可能なモジュール
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── database/
│   └── application/
├── scripts/                   # Terraform が呼び出すスクリプト
├── templates/                 # templatefile 用（*.tftpl）
└── files/                     # 静的ファイル（startup script 等）
```

### ファイル分割ルール

| ファイル | 内容 |
|---------|------|
| `main.tf` | リソース定義、モジュール呼び出し |
| `variables.tf` | 変数宣言（required → optional の順、アルファベット順） |
| `outputs.tf` | 出力値（アルファベット順） |
| `locals.tf` | ローカル値 |
| `data.tf` | データソース、IAM ポリシードキュメント |
| `providers.tf` | プロバイダー設定 |
| `versions.tf` | `required_version` / `required_providers` |
| `backend.tf` | バックエンド設定（ルートモジュールのみ） |

リソースが多い場合は目的別にファイルを分割する（`network.tf`, `iam.tf`, `dns.tf` 等）。

## 命名規約

### リソース名・変数名

```hcl
# リソース名: スネークケース（_）、TYPE からプロバイダー接頭辞を除いた名前
resource "aws_security_group" "web_server" { ... }
resource "google_compute_instance" "app_server" { ... }

# 複数の同種リソースは識別子を追加
resource "aws_s3_bucket" "data_bucket" { ... }
resource "aws_s3_bucket" "logs_bucket" { ... }

# 変数名: スネークケース、description 必須
variable "instance_type" {
  description = "EC2 インスタンスタイプ"
  type        = string
  default     = "t3.micro"
}
```

### 実リソース名（クラウド側）

```hcl
# ハイフン区切り、プロジェクト名と環境名を含める
name = "${var.project}-${var.environment}-web-server"
```

### タグ付け（必須）

```hcl
# 全リソースに以下のタグを付与
locals {
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Repository  = var.repository_url
  }
}
```

## コードスタイル

```hcl
# メタ引数を先頭に配置し、空行で区切る
resource "aws_instance" "web_server" {
  count = var.instance_count

  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  tags = merge(local.common_tags, {
    Name = "${var.project}-${var.environment}-web-${count.index}"
  })
}
```

- インデント: 2 スペース
- コメント: `#` のみ使用（`//` は使わない）
- 引数の `=` を揃える（`terraform fmt` が自動調整）
- メタ引数（`count`, `for_each`, `depends_on`, `lifecycle`）はブロック先頭に配置
- リソースブロック間は空行 1 行で区切る

## モジュール設計

### 原則

- 論理的にまとまったリソース群を 1 モジュールにする（VPC + Subnet + Gateway 等）
- モジュール内でプロバイダーやバックエンドを設定しない（ルートモジュールで設定）
- ネストモジュールは相対パス `./modules/xxx` で参照する
- 全モジュールに `README.md` を含める

### 変数設計

```hcl
# 環境依存の値: デフォルト値なし（呼び出し側で必ず指定）
variable "project_id" {
  description = "プロジェクト ID"
  type        = string
}

# 環境非依存の値: デフォルト値あり
variable "disk_size_gb" {
  description = "ディスクサイズ（GB）"
  type        = number
  default     = 50
}
```

### Output

- ルートモジュールが参照する可能性のある値はすべて output する
- `description` を必ず付与する

## State 管理

- リモートバックエンド必須（ローカル state は検証時のみ）
- 環境ごとに state ファイルを分離する
- state ロックを有効にする
- state の手動編集は禁止
- S3 バージョニング / GCS バージョニングを有効にしてバックアップを確保する

## 静的解析

コミット前に以下を実行する:

```bash
terraform fmt -check -recursive   # フォーマットチェック
terraform validate                # 構文チェック
tflint                            # Linter
# checkov / tfsec                 # セキュリティスキャン（推奨）
```

## CI/CD

| イベント | アクション |
|---------|-----------|
| PR 作成・更新 | `terraform fmt -check` → `terraform validate` → `terraform plan` |
| PR レビュー | plan 結果を確認してから承認 |
| main マージ後 | 承認済み plan で `terraform apply`（または手動承認後に apply） |

- `plan` の出力は PR コメントに自動投稿する
- `apply` は plan 確認なしに実行しない

---

## AWS 固有ルール

### State バックエンド

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-project-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

- S3 バケットのバージョニングを有効にする
- DynamoDB テーブルで state ロックを行う
- S3 バケットのパブリックアクセスをブロックする

### プロバイダー設定

```hcl
# providers.tf
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}
```

- `default_tags` で共通タグを一括設定する
- 複数リージョンが必要な場合は `alias` を使う

### IAM

```hcl
# IAM ポリシーは data ソースで定義し、iam.tf でリソースに紐付ける
# data.tf
data "aws_iam_policy_document" "app_policy" {
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.data_bucket.arn}/*"]
  }
}

# iam.tf
resource "aws_iam_policy" "app_policy" {
  name   = "${var.project}-${var.environment}-app-policy"
  policy = data.aws_iam_policy_document.app_policy.json
}
```

- 最小権限の原則を厳守する
- ワイルドカード `*` のアクション・リソース指定は禁止
- インラインポリシーより管理ポリシーを優先する

### セキュリティ

- Security Group はデフォルト deny、必要なポートのみ開放
- S3 バケットは暗号化（SSE-S3 or SSE-KMS）を有効にする
- RDS / Aurora は `deletion_protection = true` を設定する
- シークレットは AWS Secrets Manager または SSM Parameter Store（SecureString）で管理

### よく使う AWS モジュールパターン

```
modules/
├── vpc/                  # VPC, Subnet, IGW, NAT GW, Route Table
├── ecs/                  # ECS Cluster, Service, Task Definition, ALB
├── rds/                  # RDS Instance, Subnet Group, Parameter Group
├── s3/                   # S3 Bucket, Policy, Lifecycle Rule
└── iam/                  # IAM Role, Policy, Instance Profile
```

---

## Google Cloud 固有ルール

### State バックエンド

```hcl
# backend.tf
terraform {
  backend "gcs" {
    bucket = "my-project-terraform-state"
    prefix = "environments/dev"
  }
}
```

- GCS バケットのバージョニングを有効にする
- バケットに均一なバケットレベルのアクセスを設定する

### プロバイダー設定

```hcl
# providers.tf
provider "google" {
  project = var.project_id
  region  = var.region
}

# 一部リソースで必要
provider "google-beta" {
  project = var.project_id
  region  = var.region
}
```

- `google-beta` プロバイダーは必要な場合のみ使用する
- プロジェクト ID はハードコードせず変数で渡す

### API 有効化

```hcl
# モジュール内で必要な API を有効化できるようにする
variable "enable_apis" {
  description = "API を自動有効化するか"
  type        = bool
  default     = true
}

resource "google_project_service" "compute" {
  count   = var.enable_apis ? 1 : 0
  project = var.project_id
  service = "compute.googleapis.com"

  disable_on_destroy = false
}
```

- `disable_on_destroy = false` を設定して destroy 時に API が無効化されないようにする
- `enable_apis` 変数で制御可能にする

### IAM

```hcl
# プロジェクトレベルの IAM バインディング
resource "google_project_iam_member" "app_sa" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

- `google_project_iam_policy` は使わない（既存バインディングを上書きする危険がある）
- `google_project_iam_member`（個別追加）を優先する
- カスタムロールより事前定義ロールを優先する
- サービスアカウントキーの作成は避け、Workload Identity を使う

### セキュリティ

- VPC ファイアウォールはデフォルト deny、必要なルールのみ追加
- Cloud SQL は `deletion_protection = true` を設定する
- GCS バケットは均一バケットレベルのアクセス + 暗号化を有効にする
- シークレットは Secret Manager で管理する

### よく使う GCP モジュールパターン

```
modules/
├── network/              # VPC, Subnet, Firewall, Cloud NAT, Cloud Router
├── gke/                  # GKE Cluster, Node Pool
├── cloud-sql/            # Cloud SQL Instance, Database, User
├── cloud-run/            # Cloud Run Service, IAM
├── gcs/                  # GCS Bucket, IAM
└── iam/                  # Service Account, IAM Binding
```

Google 公式のモジュールも活用する: [terraform-google-modules](https://github.com/terraform-google-modules)

---

## NEVER

- `terraform apply` を plan 確認なしに実行しない
- `.tfstate` を Git にコミットしない
- `terraform.tfvars`（シークレットを含む場合）を Git にコミットしない
- state を手動で編集しない
- プロバイダーやモジュールのバージョンを固定せずに使わない
- IAM にワイルドカード `*` を使わない
- ステートフルリソース（DB 等）の `deletion_protection` を省略しない

## YOU MUST

- `terraform fmt` / `terraform validate` をコミット前に実行する
- 全変数・全 output に `description` を付与する
- 全リソースに共通タグ / ラベルを付与する
- モジュールに `README.md` を含める
- リモートバックエンドで state を管理する
- 環境ごとに state を分離する
- プロバイダーとモジュールのバージョンを固定する
- ステートフルリソースに `deletion_protection` を設定する
- PR で `terraform plan` の結果をレビューしてから apply する

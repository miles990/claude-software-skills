# Cloud Platforms Templates

Infrastructure as Code templates for AWS deployment.

## Files

| Template | Purpose |
|----------|---------|
| `main.tf` | Terraform configuration (VPC, subnets, security groups) |
| `cdk-stack.ts` | AWS CDK stack (ECS Fargate, RDS, S3) |
| `serverless.yml` | Serverless Framework (Lambda, API Gateway, DynamoDB) |

## Usage

### Terraform

```bash
cp templates/main.tf ./main.tf

# Initialize
terraform init

# Preview changes
terraform plan

# Apply
terraform apply
```

### AWS CDK

```bash
mkdir -p lib
cp templates/cdk-stack.ts lib/my-stack.ts

# Install CDK
npm install -g aws-cdk
npm install aws-cdk-lib constructs

# Bootstrap (first time only)
cdk bootstrap

# Deploy
cdk deploy
```

### Serverless Framework

```bash
cp templates/serverless.yml ./serverless.yml

# Install
npm install -g serverless
npm install serverless-offline serverless-esbuild

# Local development
serverless offline

# Deploy
serverless deploy --stage dev
```

## Comparison

| Feature | Terraform | CDK | Serverless |
|---------|-----------|-----|------------|
| Language | HCL | TypeScript | YAML |
| Best for | Multi-cloud, existing infra | AWS-native, complex apps | Lambda-based APIs |
| Learning curve | Medium | Medium | Low |
| State management | S3 backend | CloudFormation | CloudFormation |

## AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_REGION=us-east-1
```

## Environment-Specific Deployments

### Terraform
```bash
terraform workspace new prod
terraform apply -var="environment=prod"
```

### CDK
```bash
cdk deploy --context environment=prod
```

### Serverless
```bash
serverless deploy --stage prod
```

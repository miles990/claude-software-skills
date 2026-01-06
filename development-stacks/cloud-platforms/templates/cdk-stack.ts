/**
 * AWS CDK Stack Template
 * Usage: Copy to lib/my-stack.ts
 * Install: npm install aws-cdk-lib constructs
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface MyStackProps extends cdk.StackProps {
  environment: string;
}

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // ===========================================
    // VPC
    // ===========================================
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: environment === 'prod' ? 2 : 1,
    });

    // ===========================================
    // ECS Cluster
    // ===========================================
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    // ===========================================
    // Fargate Service with ALB
    // ===========================================
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      'FargateService',
      {
        cluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: environment === 'prod' ? 2 : 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry('nginx:alpine'),
          containerPort: 80,
          environment: {
            NODE_ENV: environment,
          },
        },
        publicLoadBalancer: true,
      }
    );

    // Health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
      healthyHttpCodes: '200',
    });

    // Auto Scaling
    const scaling = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: environment === 'prod' ? 10 : 2,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    // ===========================================
    // RDS Database
    // ===========================================
    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      removalPolicy:
        environment === 'prod'
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
    });

    // Allow ECS to connect to RDS
    database.connections.allowFrom(fargateService.service, ec2.Port.tcp(5432));

    // ===========================================
    // S3 Bucket
    // ===========================================
    const bucket = new s3.Bucket(this, 'Bucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy:
        environment === 'prod'
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

    // ===========================================
    // Outputs
    // ===========================================
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
  }
}

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QConvoViewerStack } from '../lib/q-convo-viewer-stack';

const app = new cdk.App();

new QConvoViewerStack(app, 'QConvoViewerStack', {
  env: {
    region: "us-east-1",
  },
  domainName: 'qview.chat',
  description: 'Static website hosting for Q Conversation Viewer using S3 and CloudFront with OAC',
});

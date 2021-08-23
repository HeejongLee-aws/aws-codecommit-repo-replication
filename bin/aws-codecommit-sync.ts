#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {TargetCodecommitReplicationStack} from "../lib/target-codecommit-replication-stack";
import {OriginCodecommitStack} from "../lib/origin-codecommit-stack";

const app = new cdk.App();
new OriginCodecommitStack(app, 'OriginCodeCommitStack', {
});

new TargetCodecommitReplicationStack(app, 'TargetCodecommitReplicationStack', {
});
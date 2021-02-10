#!/usr/bin/env node
require('dotenv').config()

import * as cdk from '@aws-cdk/core';
import { EventSubStack } from '../lib/twitch-hackathon-event-sub-stack';
import { CertStack } from '../lib/twitch-hackathon-certificate-stack';
import { AuthWebsiteStack } from '../lib/twitch-hackathon-auth-cfn-stack';
import { DynamoDBStack } from '../lib/twitch-hackathon-dynamodb-stack';
import { hackathonConfig } from '../hackathon-config';

const domainName = 'gizmo.codes';
const authCFNSubDomain = 'twitch-hackathon.';
const apiSubDomain = 'twitch-hackathon-api.';

const app = new cdk.App();

const certifcate = new CertStack(app, 'twitch-hackathon-cert', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
    domainName: domainName,
    authSubDomainName: authCFNSubDomain,
    apiSubDomainName: apiSubDomain
  });

const dynamodbStack = new DynamoDBStack(app, 'twitch-hackathon-dynamodb', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION}
  });

new EventSubStack(app, 'twitch-hackathon-event-sub', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
    eventTable: dynamodbStack.eventTable,
    eventTablePK: dynamodbStack.eventTablePK,
    subscriberTable: dynamodbStack.subscriberTable,
    subscriberTablePK: dynamodbStack.subscriberTablePK,
    domainName: domainName,
    subDomainName: apiSubDomain,
    certificate: certifcate.apiCert,
    twitchClientId: hackathonConfig.twitchClientId || process.env.TWITCH_CLIENT_ID + '',
    twitchClientSecret: hackathonConfig.twitchClientSecret || process.env.TWITCH_CLIENT_SECRET + '',
    twitchEventSubSecret: hackathonConfig.twitchEventSubSecret || process.env.TWITCH_EVENT_SUB_SECRET + ''
  });

new AuthWebsiteStack(app, 'twitch-hackathon-auth-cfn', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
    domainName: domainName,
    subDomainName: authCFNSubDomain,
    certificate: certifcate.cfnCert
  });

cdk.Tags.of(app).add("app", "twitch-hackathon");

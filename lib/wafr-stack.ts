import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { CustomRuleGroups } from './custom-rule-groups';
import _ = require('lodash');
import { ManagedRuleGroups } from './managed-rule-groups';

export class WafrStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let ruleGroups =
      ManagedRuleGroups
        .webAclRuleStatments()
        .concat(
          CustomRuleGroups.webAclRuleStatments(this))

    let webAclScope = this.node.tryGetContext('webAclScope') ? this.node.tryGetContext('webAclScope') : 'CLOUDFRONT'

    console.log(webAclScope)


    _.forEach(['REGIONAL', 'CLOUDFRONT'], webAclScope => {
      new wafv2.CfnWebACL(this, `CdkAcl${webAclScope}`, {
        scope: webAclScope,
        defaultAction: {
          allow: {
          }
        },
        rules: ruleGroups,
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          sampledRequestsEnabled: true,
          metricName: `CdkAcl${webAclScope}`,
        }
      })
    })
  }
}

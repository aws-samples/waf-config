import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import _ = require('lodash');
import { RegularExpressions } from './reqular-expressions';


export class ManagedRuleGroups {
    public static managedRuleGroups: wafv2.CfnWebACL.ManagedRuleGroupStatementProperty[] = [
        { vendorName: "AWS", name: "AWSManagedRulesAmazonIpReputationList" }
    ]

    public static webAclRuleStatments(): wafv2.CfnWebACL.RuleProperty[] {
        return _.chain(ManagedRuleGroups.managedRuleGroups).map(managedRuleGroup => {
            return {
                name: "MR" + managedRuleGroup['name'],
                priority: 0,
                action: {
                    block: {}
                },
                visibilityConfig: {
                    cloudWatchMetricsEnabled: true,
                    metricName: "Metric" + managedRuleGroup['name'],
                    sampledRequestsEnabled: true
                },
                statement: {
                    managedRuleGroupStatement: managedRuleGroup
                }
            }
        }).value()

    }

}
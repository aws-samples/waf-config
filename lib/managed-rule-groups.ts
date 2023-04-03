import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import _ = require('lodash');

export class ManagedRuleGroups {
    public static managedRuleGroups: wafv2.CfnWebACL.ManagedRuleGroupStatementProperty[] = [
        { vendorName: "AWS", name: "AWSManagedRulesAmazonIpReputationList" },
        { vendorName: "AWS", name: "AWSManagedRulesAnonymousIpList" },
        { vendorName: "AWS", name: "AWSManagedRulesKnownBadInputsRuleSet" },
        { vendorName: "AWS", name: "AWSManagedRulesCommonRuleSet" },
    ]

    public static webAclRuleStatments(): wafv2.CfnWebACL.RuleProperty[] {
        return _.chain(ManagedRuleGroups.managedRuleGroups).map(managedRuleGroup => {
            return {
                name: "MR" + managedRuleGroup['name'],
                priority: 0,
                statement: {
                    managedRuleGroupStatement: managedRuleGroup
                },
                overrideAction: {
                    none: {
                    }
                },
                visibilityConfig: {
                    cloudWatchMetricsEnabled: true,
                    metricName: "Metric" + managedRuleGroup['name'],
                    sampledRequestsEnabled: true
                },

            }
        }).value()

    }

}
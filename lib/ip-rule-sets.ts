import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

export type DefinedIpSets = { [key: string]: wafv2.CfnIPSet; }
export class IpRuleSets {
    public static defineIpRuleSets(scope: Construct, ctxConfig: any): DefinedIpSets {
        return {
            'IntegrationTesterOverideIpRuleSet': new wafv2.CfnIPSet(scope, 'IntegrationTesterOverideIpRuleSet', {
                ipAddressVersion: 'IPV4',
                addresses: [],
                scope: ctxConfig.wafScope
            }),
        }
    }
}
"""
Risk Logic Utilities
Calculate risk scores and assess threat levels for assets
"""

import math
from typing import Dict, List, Any, Tuple
from enum import Enum

from app.models import RiskLevel, AssetType

class RiskCategory(str, Enum):
    VULNERABILITY = "vulnerability"
    THREAT = "threat"
    BUSINESS_IMPACT = "business_impact"
    COMPLIANCE = "compliance"
    OPERATIONAL = "operational"

class RiskCalculator:
    """
    Risk calculation engine for asset risk assessment.
    Implements CVSS-like scoring with business context.
    """
    
    # Asset type risk multipliers
    ASSET_TYPE_MULTIPLIERS = {
        AssetType.DATABASE: 1.5,
        AssetType.SERVER: 1.3,
        AssetType.WEB_APPLICATION: 1.4,
        AssetType.NETWORK_DEVICE: 1.2,
        AssetType.WORKSTATION: 1.0,
        AssetType.MOBILE_DEVICE: 0.9,
        AssetType.IOT_DEVICE: 0.8,
        AssetType.CLOUD_SERVICE: 1.1
    }
    
    # Business unit criticality multipliers
    BUSINESS_UNIT_MULTIPLIERS = {
        "finance": 1.5,
        "hr": 1.3,
        "it": 1.4,
        "operations": 1.2,
        "marketing": 1.0,
        "sales": 1.1,
        "support": 0.9
    }
    
    @staticmethod
    def calculate_overall_risk(
        vulnerability_score: float,
        threat_score: float,
        business_impact_score: float,
        asset_type: AssetType = AssetType.SERVER,
        business_unit: str = None
    ) -> Tuple[float, RiskLevel]:
        """
        Calculate overall risk score and level.
        
        Args:
            vulnerability_score: Vulnerability assessment score (0-10)
            threat_score: Threat likelihood score (0-10)
            business_impact_score: Business impact score (0-10)
            asset_type: Type of asset
            business_unit: Business unit owning the asset
            
        Returns:
            Tuple of (overall_risk_score, risk_level)
        """
        # Base risk calculation (weighted average)
        base_risk = (
            vulnerability_score * 0.4 +  # 40% vulnerability
            threat_score * 0.3 +          # 30% threat
            business_impact_score * 0.3   # 30% business impact
        )
        
        # Apply asset type multiplier
        asset_multiplier = RiskCalculator.ASSET_TYPE_MULTIPLIERS.get(asset_type, 1.0)
        
        # Apply business unit multiplier
        business_multiplier = 1.0
        if business_unit:
            business_multiplier = RiskCalculator.BUSINESS_UNIT_MULTIPLIERS.get(
                business_unit.lower(), 1.0
            )
        
        # Calculate final risk score
        overall_risk = base_risk * asset_multiplier * business_multiplier
        overall_risk = min(overall_risk, 10.0)  # Cap at 10.0
        
        # Determine risk level
        risk_level = RiskCalculator.score_to_risk_level(overall_risk)
        
        return round(overall_risk, 2), risk_level
    
    @staticmethod
    def score_to_risk_level(score: float) -> RiskLevel:
        """
        Convert numeric risk score to risk level enum.
        
        Args:
            score: Risk score (0-10)
            
        Returns:
            RiskLevel enum value
        """
        if score >= 9.0:
            return RiskLevel.CRITICAL
        elif score >= 7.0:
            return RiskLevel.HIGH
        elif score >= 4.0:
            return RiskLevel.MEDIUM
        elif score >= 1.0:
            return RiskLevel.LOW
        else:
            return RiskLevel.INFO
    
    @staticmethod
    def calculate_vulnerability_score(findings: List[Dict[str, Any]]) -> float:
        """
        Calculate vulnerability score based on scan findings.
        
        Args:
            findings: List of vulnerability findings from scans
            
        Returns:
            Vulnerability score (0-10)
        """
        if not findings:
            return 0.0
        
        # Weight vulnerabilities by severity
        severity_weights = {
            "critical": 10.0,
            "high": 7.5,
            "medium": 5.0,
            "low": 2.5,
            "info": 0.5
        }
        
        total_score = 0.0
        max_score = 0.0
        
        for finding in findings:
            severity = finding.get("severity", "low").lower()
            weight = severity_weights.get(severity, 2.5)
            
            # Factor in exploitability and confidence
            exploitability = finding.get("exploitability", 5.0) / 10.0
            confidence = finding.get("confidence", 5.0) / 10.0
            
            finding_score = weight * exploitability * confidence
            total_score += finding_score
            max_score += 10.0  # Maximum possible score per finding
        
        # Normalize to 0-10 scale
        if max_score > 0:
            normalized_score = (total_score / max_score) * 10.0
            return min(normalized_score, 10.0)
        
        return 0.0
    
    @staticmethod
    def calculate_threat_score(
        asset_exposure: float = 5.0,
        attack_vector: str = "network",
        threat_intelligence: Dict[str, Any] = None
    ) -> float:
        """
        Calculate threat score based on asset exposure and threat intelligence.
        
        Args:
            asset_exposure: Asset exposure level (0-10)
            attack_vector: Attack vector (network, adjacent, local, physical)
            threat_intelligence: Threat intelligence data
            
        Returns:
            Threat score (0-10)
        """
        # Base threat score from exposure
        base_score = asset_exposure
        
        # Attack vector multipliers
        vector_multipliers = {
            "network": 1.0,
            "adjacent": 0.8,
            "local": 0.6,
            "physical": 0.4
        }
        
        vector_multiplier = vector_multipliers.get(attack_vector.lower(), 1.0)
        
        # Apply threat intelligence if available
        ti_multiplier = 1.0
        if threat_intelligence:
            # Check for active threats
            if threat_intelligence.get("active_campaigns", False):
                ti_multiplier += 0.3
            
            # Check threat actor interest
            actor_interest = threat_intelligence.get("actor_interest", "low")
            if actor_interest == "high":
                ti_multiplier += 0.4
            elif actor_interest == "medium":
                ti_multiplier += 0.2
        
        # Calculate final threat score
        threat_score = base_score * vector_multiplier * ti_multiplier
        return min(threat_score, 10.0)
    
    @staticmethod
    def calculate_business_impact(
        data_classification: str = "internal",
        system_criticality: str = "medium",
        user_count: int = 10,
        compliance_requirements: List[str] = None
    ) -> float:
        """
        Calculate business impact score.
        
        Args:
            data_classification: Data classification (public, internal, confidential, restricted)
            system_criticality: System criticality (low, medium, high, critical)
            user_count: Number of users affected
            compliance_requirements: List of compliance frameworks
            
        Returns:
            Business impact score (0-10)
        """
        # Data classification scores
        classification_scores = {
            "public": 2.0,
            "internal": 4.0,
            "confidential": 7.0,
            "restricted": 9.0
        }
        
        # System criticality scores
        criticality_scores = {
            "low": 2.0,
            "medium": 5.0,
            "high": 8.0,
            "critical": 10.0
        }
        
        # Base impact from data and criticality
        data_score = classification_scores.get(data_classification.lower(), 4.0)
        criticality_score = criticality_scores.get(system_criticality.lower(), 5.0)
        
        base_impact = (data_score + criticality_score) / 2
        
        # Factor in user count (logarithmic scale)
        if user_count > 0:
            user_factor = min(math.log10(user_count + 1) / 3, 1.0)  # Max 1.0 multiplier
            base_impact *= (1 + user_factor)
        
        # Compliance multiplier
        compliance_multiplier = 1.0
        if compliance_requirements:
            # High-impact compliance frameworks
            high_impact_frameworks = ["sox", "pci-dss", "hipaa", "gdpr"]
            for framework in compliance_requirements:
                if framework.lower() in high_impact_frameworks:
                    compliance_multiplier += 0.2
        
        # Calculate final business impact
        business_impact = base_impact * compliance_multiplier
        return min(business_impact, 10.0)

def assess_asset_risk(
    asset_data: Dict[str, Any],
    scan_findings: List[Dict[str, Any]] = None,
    threat_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Comprehensive asset risk assessment.
    
    Args:
        asset_data: Asset information
        scan_findings: Vulnerability scan findings
        threat_data: Threat intelligence data
        
    Returns:
        Risk assessment results
    """
    calculator = RiskCalculator()
    
    # Calculate component scores
    vulnerability_score = calculator.calculate_vulnerability_score(scan_findings or [])
    
    threat_score = calculator.calculate_threat_score(
        asset_exposure=asset_data.get("exposure_level", 5.0),
        attack_vector=asset_data.get("attack_vector", "network"),
        threat_intelligence=threat_data
    )
    
    business_impact_score = calculator.calculate_business_impact(
        data_classification=asset_data.get("data_classification", "internal"),
        system_criticality=asset_data.get("criticality", "medium"),
        user_count=asset_data.get("user_count", 10),
        compliance_requirements=asset_data.get("compliance_requirements", [])
    )
    
    # Calculate overall risk
    overall_score, risk_level = calculator.calculate_overall_risk(
        vulnerability_score,
        threat_score,
        business_impact_score,
        asset_data.get("type", AssetType.SERVER),
        asset_data.get("business_unit")
    )
    
    return {
        "vulnerability_score": round(vulnerability_score, 2),
        "threat_score": round(threat_score, 2),
        "business_impact_score": round(business_impact_score, 2),
        "overall_risk_score": overall_score,
        "risk_level": risk_level,
        "assessment_timestamp": asset_data.get("assessment_timestamp"),
        "findings_count": len(scan_findings) if scan_findings else 0
    }
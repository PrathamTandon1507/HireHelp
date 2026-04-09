from z3 import *
from models.models import ApplicationStage
from typing import Tuple

class WorkflowValidator:
    def __init__(self):
        self.solver = Solver()
        self._setup_constraints()
    
    def _setup_constraints(self):
        """Define Z3 constraints for workflow state transitions."""
        # Define stages as integers for Z3
        self.stage_mapping = {
            ApplicationStage.APPLIED: 1,
            ApplicationStage.SCREENING: 2,
            ApplicationStage.INTERVIEW: 3,
            ApplicationStage.OFFER: 4,
            ApplicationStage.ACCEPTED: 5,
            ApplicationStage.REJECTED: 6,
        }
        
        # Reverse mapping
        self.reverse_mapping = {v: k for k, v in self.stage_mapping.items()}
    
    def validate_transition(
        self,
        current_stage: ApplicationStage,
        new_stage: ApplicationStage,
        has_interview_feedback: bool = False,
        has_screening_passed: bool = False
    ) -> Tuple[bool, str]:
        """
        Validate if a stage transition is allowed.
        
        Rules:
        - Applied -> Screening (always allowed)
        - Screening -> Interview (requires screening_passed)
        - Interview -> Offer (requires interview_feedback)
        - Offer -> Accepted/Rejected (always allowed)
        - Cannot skip stages (no Applied -> Offer directly)
        - Rejected is terminal state
        """
        
        current_int = self.stage_mapping[current_stage]
        new_int = self.stage_mapping[new_stage]
        
        # Terminal state check
        if current_stage == ApplicationStage.REJECTED:
            return False, "Cannot transition from terminal REJECTED state"
        
        if current_stage == ApplicationStage.ACCEPTED:
            return False, "Cannot transition from terminal ACCEPTED state"
        
        # Same stage
        if current_int == new_int:
            return False, "Cannot transition to the same stage"
        
        # Backward transitions not allowed (except to REJECTED)
        if new_int < current_int and new_stage != ApplicationStage.REJECTED:
            return False, "Cannot move backward in workflow stages"
        
        # Specific transition rules
        if current_stage == ApplicationStage.APPLIED:
            if new_stage not in [ApplicationStage.SCREENING, ApplicationStage.REJECTED]:
                return False, "From APPLIED can only go to SCREENING or REJECTED"
        
        elif current_stage == ApplicationStage.SCREENING:
            if new_stage == ApplicationStage.INTERVIEW:
                if not has_screening_passed:
                    return False, "Screening must be passed before interview"
            elif new_stage not in [ApplicationStage.REJECTED]:
                return False, "From SCREENING can only go to INTERVIEW or REJECTED"
        
        elif current_stage == ApplicationStage.INTERVIEW:
            if new_stage == ApplicationStage.OFFER:
                if not has_interview_feedback:
                    return False, "Interview feedback required before making offer"
            elif new_stage not in [ApplicationStage.REJECTED]:
                return False, "From INTERVIEW can only go to OFFER or REJECTED"
        
        elif current_stage == ApplicationStage.OFFER:
            if new_stage not in [ApplicationStage.ACCEPTED, ApplicationStage.REJECTED]:
                return False, "From OFFER can only go to ACCEPTED or REJECTED"
        
        return True, "Transition allowed"

# Initialize validator
workflow_validator = WorkflowValidator()
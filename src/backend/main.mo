import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module PatientAssessment {
    public type RiskScores = {
      diabetesRisk : Text;
      hypertensionRisk : Text;
      cardiovascularRisk : Text;
      obesityRisk : Text;
    };

    public type PatientAssessment = {
      id : Nat;
      patientName : Text;
      age : Nat;
      gender : Text;
      bmi : Float;
      systolicBP : Nat;
      diastolicBP : Nat;
      cholesterolLevel : Text;
      bloodSugar : Nat;
      smokingStatus : Text;
      activityLevel : Text;
      familyHistory : Text;
      recommendations : Text; // Comma-separated list
      riskScores : RiskScores;
      submittedBy : Principal;
      timestamp : Time.Time;
    };
    public func compare(a : PatientAssessment, b : PatientAssessment) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type PatientAssessment = PatientAssessment.PatientAssessment;
  type RiskScores = PatientAssessment.RiskScores;

  // State management
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let assessments = Map.empty<Nat, PatientAssessment>();
  var nextId = 1;

  // Assessment logic
  func computeRiskScores(
    age : Nat,
    bmi : Float,
    systolicBP : Nat,
    diastolicBP : Nat,
    cholesterolLevel : Text,
    bloodSugar : Nat,
    smokingStatus : Text,
    activityLevel : Text,
    familyHistory : Text,
  ) : RiskScores {
    let diabetesRisk = if ((bmi > 30) or (bloodSugar > 125) or Text.equal(smokingStatus, "smoking") or Text.equal(familyHistory, "yes")) {
      "high";
    } else if ((bmi > 25) or (bloodSugar > 110) or Text.equal(cholesterolLevel, "high")) {
      "medium";
    } else {
      "low";
    };

    let hypertensionRisk = if ((systolicBP > 140) or (diastolicBP > 90) or Text.equal(smokingStatus, "smoking")) {
      "high";
    } else if ((systolicBP > 130) or (diastolicBP > 85)) {
      "medium";
    } else {
      "low";
    };

    let cardiovascularRisk = if ((bmi > 30) or Text.equal(smokingStatus, "smoking") or Text.equal(cholesterolLevel, "high")) {
      "high";
    } else if ((bmi > 25) or Text.equal(cholesterolLevel, "borderline")) {
      "medium";
    } else {
      "low";
    };

    let obesityRisk = if (bmi > 30) {
      "high";
    } else if (bmi > 25) {
      "medium";
    } else {
      "low";
    };

    {
      diabetesRisk;
      hypertensionRisk;
      cardiovascularRisk;
      obesityRisk;
    };
  };

  func generateRecommendations(riskScores : RiskScores) : Text {
    let recs : [Text] = [
      "Maintain a healthy diet",
      "Exercise regularly",
      if (Text.equal(riskScores.diabetesRisk, "high") or Text.equal(riskScores.hypertensionRisk, "high")) {
        "Monitor blood pressure, Reduce salt intake";
      } else { "" },
      if (Text.equal(riskScores.cardiovascularRisk, "high")) {
        "Increase cardiovascular activity, Consult with cardiologist";
      } else { "" },
      if (not Text.equal(riskScores.obesityRisk, "low")) {
        "Consult a nutritionist for weight management";
      } else { "" },
    ];

    recs.filter(func(s) { s.size() > 0 }).values().join(", ");
  };

  // Public API
  public shared ({ caller }) func submitAssessment(
    patientName : Text,
    age : Nat,
    gender : Text,
    bmi : Float,
    systolicBP : Nat,
    diastolicBP : Nat,
    cholesterolLevel : Text,
    bloodSugar : Nat,
    smokingStatus : Text,
    activityLevel : Text,
    familyHistory : Text,
  ) : async PatientAssessment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit assessments");
    };

    let riskScores = computeRiskScores(age, bmi, systolicBP, diastolicBP, cholesterolLevel, bloodSugar, smokingStatus, activityLevel, familyHistory);
    let recommendations = generateRecommendations(riskScores);

    let assessment : PatientAssessment = {
      id = nextId;
      patientName;
      age;
      gender;
      bmi;
      systolicBP;
      diastolicBP;
      cholesterolLevel;
      bloodSugar;
      smokingStatus;
      activityLevel;
      familyHistory;
      riskScores;
      recommendations;
      submittedBy = caller;
      timestamp = Time.now();
    };

    assessments.add(nextId, assessment);
    nextId += 1;
    assessment;
  };

  public query ({ caller }) func getMyAssessments() : async [PatientAssessment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assessments");
    };
    assessments.values().toArray().filter(func(a) { a.submittedBy == caller }).sort();
  };

  public query ({ caller }) func getAssessment(id : Nat) : async ?PatientAssessment {
    switch (assessments.get(id)) {
      case null { null };
      case (?assessment) {
        // Only allow the owner or admins to view the assessment
        if (caller != assessment.submittedBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own assessments");
        };
        ?assessment;
      };
    };
  };
};

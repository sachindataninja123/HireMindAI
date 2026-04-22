import React, { useState } from "react";
import Step1Setup from "../components/Step1Setup";
import Step2Interview from "../components/Step2Interview";
import Step3Report from "../components/Step3Report";

const InterviewPage = () => {
  const [step, setStep] = useState(1);
  const [interViewData, setInterViewData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 1 && (
        <Step1Setup
          onStart={(data) => {
            setInterViewData(data);
            setStep(2);
          }}
        />
      )}

      {step === 1 && (
        <Step2Interview
          interViewData={interViewData}
          onFinish={(report) => {
            setInterViewData(report);
            setStep(2);
          }}
        />
      )}

      {step === 1 && <Step3Report report={interViewData} />}
    </div>
  );
};

export default InterviewPage;

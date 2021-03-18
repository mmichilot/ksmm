import { ReactWidget } from "@jupyterlab/apputils";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import { JSONSchema7 } from "json-schema";
import Form from "@rjsf/bootstrap-4";
import * as _ from "lodash";
import ClipLoader from "react-spinners/ClipLoader";
import SelectorComponent from "./selector";

/**
 * React component for listing the possible
 * ipykernel options.
 *
 *
 * @returns The React component
 */
const KernelManagerComponent = (): JSX.Element => {
  const [data, setData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showFormSelector, setShowFormSelector] = useState(false);
  const [kernelFormData, setKernelFormData] = useState({});
  const [selectedKernelName, setSelectedKernelName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const ipyschema: JSONSchema7 = {
    title: "ipykernel mm",
    type: "object",
    properties: {
      argv: { type: "array", items: { type: "string" } },
      env: { type: "object" },
      display_name: { type: "string" },
      language: { type: "string" },
      interrupt_mode: { type: "string" },
      metadata: { type: "object" },
    },
    required: [
      "argv",
      "display_name",
      "env",
      "interrupt_mode",
      "language",
      "metadata",
    ],
  };

  /**
   * Handles a form submission when
   * kernels are modified in any form.
   *
   * Passed as a prop to Form
   */
  const handleKernelSubmission = (e: any) => {
    console.log("Submission invoked");
    console.log("frm d", e);
    const url = "http://localhost:8888/ks";
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        editedKernelPayload: JSON.stringify(e.formData),
        originalKernelName: selectedKernelName,
      }),
    });
  };
  /**
   * Handles the Kernel Selection
   * at the select screen.
   */
  const handleSelectedKernel = (
    { formData }: { formData: { ipykernels: string } },
    e: any
  ) => {
    const a = JSON.parse(JSON.stringify(data));
    setSelectedKernelName(formData.ipykernels);
    console.log(a[formData.ipykernels]);
    setKernelFormData(a[formData.ipykernels]);
    setShowFormSelector(false);
    setShowForm(true);
  };

  /**
   * At each component render,
   * render the proper component given the
   * constraints.
   *
   */
  const renderWidgets = () => {
    if (isLoading == true && showForm == false && data) {
      setIsLoading(false);
      setShowFormSelector(true);
    }
  };

  useEffect(() => {
    const url = "http://localhost:8888/ks";
    const kernelSpec = async () => {
      const response = await fetch(url);
      const jsondata = await response.json();
      if (!_.isEqual(data, jsondata)) {
        console.log("setting data", jsondata);
        setData(jsondata);
      }
    };

    const timer = setInterval(() => {
      kernelSpec();
      renderWidgets();
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [data]);

  return (
    <div>
      <Container fluid className="jp-ReactForm">
        {isLoading ? (
          <ClipLoader color={"9ef832"} loading={true} size={150} />
        ) : null}
        {showFormSelector ? (
          <SelectorComponent
            handleSubmit={handleSelectedKernel}
            values={Object.keys(data)}
          />
        ) : null}
        {showForm ? (
          <Form
            schema={ipyschema}
            formData={kernelFormData}
            onSubmit={handleKernelSubmission}
          />
        ) : null}
      </Container>
    </div>
  );
};

/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class CounterWidget extends ReactWidget {
  /**
   * Constructs a new CounterWidget.
   */
  constructor() {
    super();
    this.addClass("jp-ReactWidget");
    this.addClass("jp-ReactForm");
  }

  render(): JSX.Element {
    return <KernelManagerComponent />;
  }
}

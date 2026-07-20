import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Path1() {
  const navigate = useNavigate();

  const [sourceFields, setSourceFields] =
    useState([]);

  const [
    destinationFields,
    setDestinationFields,
  ] = useState([]);

  const [sourceData, setSourceData] =
    useState({});

  const [
    selectedMappings,
    setSelectedMappings,
  ] = useState({});

  const [generatedJson, setGeneratedJson] =
    useState(null);

  const [mappingName, setMappingName] =
    useState("");

  // Upload Source JSON
  const handleSourceUpload = (
    event
  ) => {
    const file =
      event.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData =
          JSON.parse(
            e.target.result
          );

        setSourceData(
          jsonData
        );

        if (
          !Array.isArray(
            jsonData
          )
        ) {
          setSourceFields(
            Object.keys(
              jsonData
            )
          );
        } else if (
          jsonData.length >
          0
        ) {
          setSourceFields(
            Object.keys(
              jsonData[0]
            )
          );
        }
      } catch {
        alert(
          "Invalid Source JSON"
        );
      }
    };

    reader.readAsText(
      file
    );
  };

  // Upload Destination JSON
  const handleDestinationUpload =
    (event) => {
      const file =
        event.target
          .files[0];

      if (!file)
        return;

      const reader =
        new FileReader();

      reader.onload = (
        e
      ) => {
        try {
          const jsonData =
            JSON.parse(
              e.target
                .result
            );

          setDestinationFields(
            Object.keys(
              jsonData
            )
          );
        } catch {
          alert(
            "Invalid Destination JSON"
          );
        }
      };

      reader.readAsText(
        file
      );
    };

  // Source Dropdown Change
  const handleSelectChange =
    (
      destinationField,
      value
    ) => {
      const usedSources =
        Object.entries(
          selectedMappings
        )
          .filter(
            ([key]) =>
              key !==
              destinationField
          )
          .map(
            ([, value]) =>
              value
          );

      if (
        usedSources.includes(
          value
        )
      ) {
        alert(
          "Source field already used"
        );
        return;
      }

      setSelectedMappings(
        (prev) => ({
          ...prev,
          [destinationField]:
            value,
        })
      );
    };

  // Generate Mapping
  const generateMapping =
    () => {
      const createMappedObject =
        (item) => {
          let mappedItem =
            {};

          destinationFields.forEach(
            (
              destinationField
            ) => {
              const sourceField =
                selectedMappings[
                  destinationField
                ];

              if (
                sourceField
              ) {
                mappedItem[
                  destinationField
                ] =
                  item[
                    sourceField
                  ];
              }
            }
          );

          return mappedItem;
        };

      if (
        !Array.isArray(
          sourceData
        )
      ) {
        setGeneratedJson(
          createMappedObject(
            sourceData
          )
        );
      } else {
        const mappedArray =
          sourceData.map(
            (item) =>
              createMappedObject(
                item
              )
          );

        setGeneratedJson(
          mappedArray
        );
      }
    };
    // Save Mapping
  const saveMapping =
    async () => {
      if (
        !mappingName.trim()
      ) {
        alert(
          "Please enter mapping name"
        );
        return;
      }

      const mappings =
        destinationFields
          .map(
            (
              destinationField
            ) => ({
              sourceField:
                selectedMappings[
                  destinationField
                ],
              destinationField:
                destinationField,
            })
          )
          .filter(
            (m) =>
              m.sourceField
          );

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/save-mapping`,
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                {
                  mappingName,
                  mappings,
                }
              ),
            }
          );

        const data =
          await response.json();

        if (
          response.ok
        ) {
          alert(
            data.message
          );
        } else {
          alert(
            data.error
          );
        }
      } catch {
        alert(
          "Failed to save mapping"
        );
      }
    };

  const updateMapping =
    async () => {
      try {
        const editedKeys =
          Object.keys(
            generatedJson
          );

        const mappings =
          editedKeys.map(
            (
              destinationField,
              index
            ) => ({
              sourceField:
                Object.values(
                  selectedMappings
                )[index],
              destinationField:
                destinationField,
            })
          );

        const response =
          await fetch(
            `${API_BASE_URL}/update-mapping`,
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                mappingName,
                mappings,
              }),
            }
          );

        const data =
          await response.json();

        if (
          response.ok
        ) {
          alert(
            data.message
          );
        } else {
          alert(
            data.error
          );
        }
      } catch {
        alert(
          "Update failed"
        );
      }
    };

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "linear-gradient(135deg,#dbeafe,#ede9fe,#fce7f3)",
        padding:
          "40px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1200px",
          margin:
            "auto",
          background:
            "#fff",
          borderRadius:
            "20px",
          padding:
            "40px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          style={{
            textAlign:
              "center",
            fontSize:
              "36px",
            color:
              "#1e293b",
            marginBottom:
              "40px",
          }}
        >
          JSON Mapping Utility
        </h1>

        <div
          style={{
            display:
              "flex",
            gap: "30px",
            marginBottom:
              "30px",
          }}
        >
          <div
            style={{
              flex: 1,
            }}
          >
            <h3
              style={{
                color:
                  "#334155",
              }}
            >
              Source JSON
            </h3>

            <input
              type="file"
              accept=".json"
              onChange={
                handleSourceUpload
              }
            />
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <h3
              style={{
                color:
                  "#334155",
              }}
            >
              Destination JSON
            </h3>

            <input
              type="file"
              accept=".json"
              onChange={
                handleDestinationUpload
              }
            />
          </div>
        </div>

        {sourceFields.length >
          0 &&
          destinationFields.length >
            0 && (
            <>
              <h2
                style={{
                  color:
                    "#1e293b",
                }}
              >
                Field Mapping
              </h2>

              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  overflow:
                    "hidden",
                  borderRadius:
                    "12px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#2563eb",
                      color:
                        "white",
                    }}
                  >
                    <th
                      style={{
                        padding:
                          "15px",
                      }}
                    >
                      Destination Field
                    </th>

                    <th
                      style={{
                        padding:
                          "15px",
                      }}
                    >
                      Source Field
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {destinationFields.map(
                    (
                      destinationField,
                      index
                    ) => (
                      <tr
                        key={
                          index
                        }
                      >
                        <td
                          style={{
                            padding:
                              "15px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          {
                            destinationField
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "15px",
                            borderBottom:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <select
                            value={
                              selectedMappings[
                                destinationField
                              ] ||
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              handleSelectChange(
                                destinationField,
                                e.target
                                  .value
                              )
                            }
                            style={{
                              width:
                                "220px",
                              padding:
                                "10px",
                              borderRadius:
                                "8px",
                              border:
                                "1px solid #cbd5e1",
                            }}
                          >
                            <option value="">
                              Select Source
                            </option>

                            {sourceFields
                              .filter(
                                (
                                  sourceField
                                ) => {
                                  const usedSources =
                                    Object.entries(
                                      selectedMappings
                                    )
                                      .filter(
                                        ([key]) =>
                                          key !==
                                          destinationField
                                      )
                                      .map(
                                        (
                                          [
                                            ,
                                            value,
                                          ]
                                        ) =>
                                          value
                                      );

                                  return !usedSources.includes(
                                    sourceField
                                  );
                                }
                              )
                              .map(
                                (
                                  sourceField,
                                  i
                                ) => (
                                  <option
                                    key={
                                      i
                                    }
                                    value={
                                      sourceField
                                    }
                                  >
                                    {
                                      sourceField
                                    }
                                  </option>
                                )
                              )}
                          </select>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              <div
                style={{
                  marginTop:
                    "25px",
                }}
              >
                <input
                  type="text"
                  placeholder="Enter Mapping Name"
                  value={
                    mappingName
                  }
                  onChange={(
                    e
                  ) =>
                    setMappingName(
                      e.target
                        .value
                    )
                  }
                  style={{
                    width:
                      "300px",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #cbd5e1",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop:
                    "20px",
                  display:
                    "flex",
                  gap: "10px",
                }}
              >
                <button
                  onClick={
                    generateMapping
                  }
                  style={{
                    background:
                      "#2563eb",
                    color:
                      "white",
                    border:
                      "none",
                    padding:
                      "12px 20px",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                  }}
                >
                  Generate Mapping
                </button>

                <button
                  onClick={
                    saveMapping
                  }
                  style={{
                    background:
                      "#16a34a",
                    color:
                      "white",
                    border:
                      "none",
                    padding:
                      "12px 20px",
                    borderRadius:
                      "8px",
                    cursor:
                      "pointer",
                  }}
                >
                  Save Mapping
                </button>
              </div>
            </>
          )}

        {generatedJson && (
          <div
            style={{
              marginTop:
                "40px",
            }}
          >
            <h2
              style={{
                color:
                  "#1e293b",
              }}
            >
              Generated JSON
            </h2>

            <textarea
              value={JSON.stringify(
                generatedJson,
                null,
                2
              )}
              onChange={(
                e
              ) => {
                try {
                  setGeneratedJson(
                    JSON.parse(
                      e.target
                        .value
                    )
                  );
                } catch {}
              }}
              style={{
                width:
                  "100%",
                height:
                  "350px",
                background:
                  "#0f172a",
                color:
                  "#f8fafc",
                padding:
                  "15px",
                borderRadius:
                  "12px",
                border:
                  "none",
                fontFamily:
                  "monospace",
                fontSize:
                  "14px",
              }}
            />

            <div
              style={{
                marginTop:
                  "15px",
              }}
            >
              <button
                onClick={
                  updateMapping
                }
                style={{
                  background:
                    "#f59e0b",
                  color:
                    "white",
                  border:
                    "none",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop:
              "30px",
          }}
        >
          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              background:
                "#64748b",
              color:
                "white",
              border:
                "none",
              padding:
                "12px 20px",
              borderRadius:
                "8px",
              cursor:
                "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Path1;
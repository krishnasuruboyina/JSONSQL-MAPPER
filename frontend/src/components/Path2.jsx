import {
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Path2() {
  const navigate =
    useNavigate();

  const [
    sourceData,
    setSourceData,
  ] = useState(null);

  const [
    mappingNames,
    setMappingNames,
  ] = useState([]);

  const [
    selectedMapping,
    setSelectedMapping,
  ] = useState("");

  const [
    deleteMappingName,
    setDeleteMappingName,
  ] = useState("");

  const [
    generatedJson,
    setGeneratedJson,
  ] = useState(null);

  const [
  updateMappingName,
  setUpdateMappingName,
] = useState("");

const [mode, setMode] =
  useState("");

const [
  editableMappings,
  setEditableMappings,
] = useState([]);

  // Load mapping names
  useEffect(() => {
    fetch(
      `${API_BASE_URL}/get-mappings`
    )
      .then((res) =>
        res.json()
      )
      .then((data) =>
        setMappingNames(
          data
        )
      )
      .catch((err) =>
        console.log(
          err
        )
      );
  }, []);

  // Upload Source JSON
  const handleSourceUpload =
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

          setSourceData(
            jsonData
          );
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

  // Generate Mapping
  const generateMapping =
    async () => {
      if (
        !selectedMapping
      ) {
        alert(
          "Please select mapping"
        );
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/get-mapping-details/${selectedMapping}`
          );

        const mappingData =
          await response.json();

        const createMappedObject =
          (item) => {
            let mappedItem =
              {};

            mappingData.forEach(
              (
                map
              ) => {
                mappedItem[
                  map.destination_field
                ] =
                  item[
                    map.source_field
                  ];
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
              (
                item
              ) =>
                createMappedObject(
                  item
                )
            );

          setGeneratedJson(
            mappedArray
          );
        }
      } catch {
        alert(
          "Failed to generate mapping"
        );
      }
    };

  // Export JSON
  const exportJson =
    () => {
      if (
        !generatedJson
      ) {
        alert(
          "No JSON to export"
        );
        return;
      }

      const blob =
        new Blob(
          [
            JSON.stringify(
              generatedJson,
              null,
              2
            ),
          ],
          {
            type:
              "application/json",
          }
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        URL.createObjectURL(
          blob
        );

      link.download =
        "mapped_output.json";

      link.click();
    };

  // Delete Mapping
  const deleteMapping =
    async () => {
      if (
        !deleteMappingName
      ) {
        alert(
          "Please select mapping"
        );
        return;
      }

      const confirmDelete =
        window.confirm(
          `Delete mapping ${deleteMappingName}?`
        );

      if (
        !confirmDelete
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/delete-mapping`,
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                mappingName:
                  deleteMappingName,
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

          setMappingNames(
            mappingNames.filter(
              (m) =>
                m !==
                deleteMappingName
            )
          );

          setDeleteMappingName(
            ""
          );
        } else {
          alert(
            data.error
          );
        }
      } catch {
        alert(
          "Delete failed"
        );
      }
    };
      const loadMappingForEdit =
  async () => {

    if (!updateMappingName) {
      alert("Select Mapping");
      return;
    }

    try {
      const response =
  await fetch(
    `${API_BASE_URL}/get-mapping-details/${updateMappingName}`
  )

      const data =
        await response.json();

      setEditableMappings(
  data
);

setMode(
  "update"
);


    } catch {
      alert(
        "Failed to load mapping"
      );
    }
  

    };
    const saveChanges =
  async () => {

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/update-mapping`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              mappingName:
                updateMappingName,
              mappings:
                editableMappings.map(
                  (item) => ({
                    sourceField:
                      item.source_field,
                    destinationField:
                      item.destination_field,
                  })
                ),
            }),
          }
        );

      const data =
  await response.json();

if (response.ok) {

  alert(
    data.message
  );

  setMode("");
  setEditableMappings([]);

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
          "linear-gradient(135deg, #dbeafe, #ede9fe, #fce7f3)",
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
            "white",
          borderRadius:
            "20px",
          padding:
            "40px",
          boxShadow:
            "0px 10px 35px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            textAlign:
              "center",
            color:
              "#2c3e50",
            marginBottom:
              "30px",
          }}
        >
          Path 2 -
          Existing Mapping
        </h1>

        <div
          style={{
            display:
              "flex",
            gap: "20px",
            marginBottom:
              "30px",
          }}
        >
          {/* Upload Source JSON */}
          <div
            style={{
              flex: 0.5,
            }}
          >
            <h3>
              Upload Source JSON
            </h3>

            <input
              type="file"
              accept=".json"
              onChange={
                handleSourceUpload
              }
              style={{
                width:
                  "250px",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #ccc",
              }}
            />
          </div>

          {/* Existing Mapping */}
          <div
            style={{
              flex: 1,
            }}
          >
            <h3>
              Select Existing Mapping
            </h3>

            <select
              value={
                selectedMapping
              }
              onChange={(
                e
              ) =>
                setSelectedMapping(
                  e.target
                    .value
                )
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #ccc",
                background:
                  "white",
              }}
            >
              <option value="">
                Select Mapping
              </option>

              {mappingNames.map(
                (
                  mapping,
                  index
                ) => (
                  <option
                    key={
                      index
                    }
                    value={
                      mapping
                    }
                  >
                    {
                      mapping
                    }
                  </option>
                )
              )}
            </select>
          </div>
          {/* Update Mapping */}
<div
  style={{
    flex: 1,
  }}
>
  <h3>
    Update Mapping
  </h3>

  <select
  value={updateMappingName}
  onChange={(e) =>
    setUpdateMappingName(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    background: "white",
  }}
>
    <option value="">
      Select Mapping
    </option>

    {mappingNames.map(
      (mapping, index) => (
        <option
          key={index}
          value={mapping}
        >
          {mapping}
        </option>
      )
    )}
  </select>

<button
  onClick={loadMappingForEdit}
  style={{
    marginTop: "10px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#e91e63",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  }}
>
  Update Mapping
</button>

</div>
  

          {/* Delete Mapping */}
          <div
            style={{
              flex: 1,
            }}
          >
            <h3>
              Delete Mapping
            </h3>

            <select
              value={
                deleteMappingName
              }
              onChange={(
                e
              ) =>
                setDeleteMappingName(
                  e.target
                    .value
                )
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #ccc",
                background:
                  "white",
              }}
            >
              <option value="">
                Select Mapping
              </option>

              {mappingNames.map(
                (
                  mapping,
                  index
                ) => (
                  <option
                    key={
                      index
                    }
                    value={
                      mapping
                    }
                  >
                    {
                      mapping
                    }
                  </option>
                )
              )}
            </select>

            <button
              onClick={
                deleteMapping
              }
              style={{
                marginTop:
                  "10px",
                width:
                  "100%",
                padding:
                  "12px",
                border:
                  "none",
                borderRadius:
                  "10px",
                background:
                  "#e74c3c",
                color:
                  "white",
                fontWeight:
                  "bold",
                cursor:
                  "pointer",
              }}
            >
              Delete Mapping
            </button>
          </div>
        </div>

        <div
          style={{
            display:
              "flex",
            gap: "15px",
            marginTop:
              "30px",
          }}
        >
        
          <button
            onClick={
              generateMapping
            }
            style={{
              flex: 1,
              padding:
                "14px",
              border:
                "none",
              borderRadius:
                "10px",
              background:
                "#3498db",
              color:
                "white",
              fontWeight:
                "bold",
              cursor:
                "pointer",
            }}
          >
            Generate Mapping
          </button>

          <button
            onClick={
              exportJson
            }
            style={{
              flex: 1,
              padding:
                "14px",
              border:
                "none",
              borderRadius:
                "10px",
              background:
                "#27ae60",
              color:
                "white",
              fontWeight:
                "bold",
              cursor:
                "pointer",
            }}
          >
            Export JSON
          </button>

          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              flex: 1,
              padding:
                "14px",
              border:
                "none",
              borderRadius:
                "10px",
              background:
                "#7f8c8d",
              color:
                "white",
              fontWeight:
                "bold",
              cursor:
                "pointer",
            }}
          >
            Back
          </button>
        </div>
        {mode === "update" && (
  <div
    style={{
      marginTop: "30px",
      background: "#f8f9fa",
      padding: "20px",
      borderRadius: "10px",
    }}
  >
    <h2>Edit Mapping</h2>

    {editableMappings.map(
      (mapping, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
          }}
        >

          <input
            value={mapping.destination_field}
            onChange={(e) => {
              const temp = [...editableMappings];
              temp[index].destination_field =
                e.target.value;
              setEditableMappings(temp);
            }}
            style={{
              width: "100%",
              padding: "10px",
            }}
          />
        </div>
      )
    )}

    <button
      onClick={saveChanges}
      style={{
        padding: "12px",
        border: "none",
        borderRadius: "10px",
        background: "#27ae60",
        color: "white",
        fontWeight: "bold",
      }}
    >
      Save Changes
    </button>
  </div>
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
                  "#2c3e50",
              }}
            >
              Generated JSON
            </h2>

            <pre
              style={{
                background:
                  "#2c3e50",
                color:
                  "white",
                padding:
                  "20px",
                borderRadius:
                  "15px",
                overflowX:
                  "auto",
              }}
            >
              {JSON.stringify(
                generatedJson,
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Path2;
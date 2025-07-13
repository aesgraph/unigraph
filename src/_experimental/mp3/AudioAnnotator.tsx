import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import WaveSurfer from "wavesurfer.js";
import { getRandomColorFromPalette } from "../../utils/colorUtils";
import "./AudioAnnotator.css";
import { demoSongAnnotations } from "./data";
import { SongAnnotationData } from "./SongAnnotation";
import TimelineChart from "./TimelineChart";

const gentlePalette = [
  getRandomColorFromPalette("gentle"),
  getRandomColorFromPalette("gentle"),
  getRandomColorFromPalette("gentle"),
  getRandomColorFromPalette("gentle"),
];

// Add tag to color mapping
const tagColors: { [key: string]: string } = {
  tag1: gentlePalette[0], // A button
  tag2: gentlePalette[1], // S button
  tag3: gentlePalette[2], // D button
  tag4: gentlePalette[3], // F button
};

interface AnnotationEditorProps {
  annotation: SongAnnotationData;
  onSave: (updatedAnnotation: SongAnnotationData) => void;
  onClose: () => void;
}

const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  annotation,
  onSave,
  onClose,
}) => {
  const [text, setText] = useState(annotation.text);
  const [description, setDescription] = useState(annotation.description);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(Array.from(annotation.tags));

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave({
      ...annotation,
      text,
      description,
      tags: new Set(tags),
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "400px",
        zIndex: 1000, // Add high z-index
      }}
    >
      <h3>Edit Annotation</h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Text:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "5px", minHeight: "100px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>Tags:</label>
        <div style={{ display: "flex", gap: "5px" }}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            style={{ flex: 1, padding: "5px" }}
          />
          <button onClick={handleAddTag}>Add Tag</button>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "5px",
            marginTop: "5px",
          }}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "#e0e0e0",
                padding: "2px 8px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

const AudioAnnotator: React.FC = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [annotations, setAnnotations] = useState<SongAnnotationData[]>([]);
  const [annotationText, setAnnotationText] = useState<string>("");
  const [_audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [editingAnnotation, setEditingAnnotation] =
    useState<SongAnnotationData | null>(null);
  const [duration, setDuration] = useState(0);
  const [isQuickTagMode, setIsQuickTagMode] = useState(true);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const handleQuickTag = useCallback(
    (tags: string[]) => {
      if (wavesurferRef.current) {
        const currentTime = wavesurferRef.current.getCurrentTime();

        // Check if an annotation at the same timestamp already exists
        const existingAnnotation = annotations.find(
          (annotation) => annotation.time.toFixed(2) === currentTime.toFixed(2)
        );

        if (existingAnnotation) {
          // Merge new tags with existing ones
          const updatedTags = new Set([...existingAnnotation.tags, ...tags]);
          const updatedAnnotation = {
            ...existingAnnotation,
            tags: updatedTags,
          };
          setAnnotations((prevAnnotations) =>
            prevAnnotations.map((a) =>
              a.id === existingAnnotation.id ? updatedAnnotation : a
            )
          );
          return;
        }

        const id = `${tags.join("-")}-${currentTime.toFixed(2)}`;
        const newAnnotation: SongAnnotationData = {
          id,
          time: currentTime,
          text: "",
          description: "",
          tags: new Set(tags),
          type: "",
          userData: {},
        };
        setAnnotations((prevAnnotations) => [
          ...prevAnnotations,
          newAnnotation,
        ]);
      }
    },
    [annotations] // Keep annotations in dependency array
  );

  const handleClearAnnotations = () => {
    setAnnotations([]);
  };

  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.filter((annotation) => annotation.id !== id)
    );
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isQuickTagMode) return; // Early return if not in quick tag mode

      const key = event.key.toLowerCase();
      const button = document.getElementById(`quick-tag-${key}`);
      if (button) {
        button.classList.add("active");
        setTimeout(() => button.classList.remove("active"), 200);
      }
      switch (key) {
        case "a":
          handleQuickTag(["tag1"]);
          break;
        case "s":
          handleQuickTag(["tag2"]);
          break;
        case "d":
          handleQuickTag(["tag3"]);
          break;
        case "f":
          handleQuickTag(["tag4"]);
          break;
        default:
          break;
      }
    },
    [handleQuickTag, isQuickTagMode] // Add isQuickTagMode to dependencies
  ); // Add handleQuickTag as dependency

  useEffect(() => {
    console.log("annotations updated:", annotations);
  }, [annotations]); // Fix the syntax error in the dependency array

  useEffect(() => {
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [handleKeyPress]); // Add handleKeyPress as dependency

  useEffect(() => {
    // Initialize wavesurfer
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "gray",
        progressColor: "blue",
        cursorColor: "red",
        barWidth: 3,
        height: 100,
      });

      // Add event listeners
      wavesurferRef.current.on("audioprocess", (time) => {
        setCurrentTime(time);
      });

      wavesurferRef.current.on("finish", () => {
        setIsPlaying(false);
      });

      wavesurferRef.current.on("play", () => {
        setIsPlaying(true);
      });

      wavesurferRef.current.on("pause", () => {
        setIsPlaying(false);
      });

      // Set initial annotations
      setAnnotations(demoSongAnnotations.getDatas());

      // Add duration event handler
      wavesurferRef.current.on("ready", () => {
        setDuration(wavesurferRef.current?.getDuration() || 0);
        setIsAudioLoaded(true);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        setIsAudioLoaded(false);
      }
    };
  }, []); // Empty dependency array since this only runs once

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      wavesurferRef.current?.load(url);
    }
  };

  const togglePlayPause = () => {
    wavesurferRef.current?.playPause();
  };

  const handleRestart = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(0);
      wavesurferRef.current.play();
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleAddAnnotation = () => {
    if (wavesurferRef.current && annotationText.trim()) {
      const newAnnotation: SongAnnotationData = {
        id: Math.random().toString(36).substr(2, 9),
        time: wavesurferRef.current.getCurrentTime(),
        text: annotationText,
        description: "",
        tags: new Set(),
        type: "",
        userData: {},
      };
      setAnnotations((prevAnnotations) => [...prevAnnotations, newAnnotation]);
      setAnnotationText("");
    }
  };

  const handleUpdateAnnotation = (updatedAnnotation: SongAnnotationData) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((a) =>
        a.id === updatedAnnotation.id ? updatedAnnotation : a
      )
    );
  };

  const handleJumpToAnnotation = (time: number) => {
    wavesurferRef.current?.seekTo(time / wavesurferRef.current.getDuration());
  };

  const handleExportAnnotations = () => {
    const transformedAnnotations = annotations.map((a) => ({
      ...a,
      tags: Array.from(a.tags),
    }));
    const dataStr = JSON.stringify(transformedAnnotations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "annotations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportAnnotations = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedAnnotations = JSON.parse(e.target?.result as string);
          setAnnotations(importedAnnotations);
        } catch (error) {
          console.error("Failed to parse annotations:", error);
          alert("Failed to import annotations. Invalid file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const renderAnnotationTable = useMemo(
    () => (
      <TableContainer
        component={Paper}
        style={{
          maxHeight: "calc(100vh - 200px)",
          marginTop: "20px",
          backgroundColor: "#f5f5f5",
          position: "relative", // Add relative positioning
          zIndex: 1, // Add lower z-index
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: "bold" }}>Time</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Text</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Tags</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {annotations
              .sort((a, b) => a.time - b.time)
              .map((annotation) => (
                <TableRow
                  key={annotation.id}
                  hover
                  style={{ cursor: "pointer" }}
                  onClick={() => handleJumpToAnnotation(annotation.time)}
                >
                  <TableCell>{formatTime(annotation.time)}</TableCell>
                  <TableCell>{annotation.text}</TableCell>
                  <TableCell>{annotation.description}</TableCell>
                  <TableCell>
                    <div
                      style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                    >
                      {Array.from(annotation.tags).map((tag) => (
                        <span
                          key={tag}
                          style={{
                            backgroundColor: tagColors[tag] || "#e0e0e0",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8em",
                            color: "white",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAnnotation(annotation);
                      }}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#4a90e2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "5px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAnnotation(annotation.id);
                      }}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [annotations]
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>MP3 Playback & Annotator</h2>
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleImportAnnotations}
            style={{ display: "none" }}
            id="import-annotations"
          />
          <label htmlFor="import-annotations">
            <button
              onClick={() =>
                document.getElementById("import-annotations")?.click()
              }
              style={{
                marginRight: "10px",
                padding: "8px 16px",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Import Annotations
            </button>
          </label>
          <button
            onClick={handleExportAnnotations}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Export Annotations
          </button>
          <button
            onClick={handleClearAnnotations}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear Annotations
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "20px" }}>
            <input type="file" accept="audio/mp3" onChange={handleFileUpload} />
          </div>

          <div ref={waveformRef} style={{ marginBottom: "20px" }}></div>

          <TimelineChart
            annotations={annotations}
            duration={duration}
            onClickAnnotation={handleJumpToAnnotation}
            tagColors={tagColors}
          />

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={togglePlayPause}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginRight: "10px",
                opacity: isAudioLoaded ? 1 : 0.5,
                cursor: isAudioLoaded ? "pointer" : "not-allowed",
              }}
              disabled={!isAudioLoaded}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={handleRestart}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginRight: "10px",
                opacity: isAudioLoaded ? 1 : 0.5,
                cursor: isAudioLoaded ? "pointer" : "not-allowed",
              }}
              disabled={!isAudioLoaded}
            >
              Restart
            </button>
            <span style={{ fontSize: "16px" }}>{formatTime(currentTime)}</span>
          </div>

          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <input
                type="checkbox"
                checked={isQuickTagMode}
                onChange={(e) => setIsQuickTagMode(e.target.checked)}
              />
              Enable Quick Tag Mode (A/S/D/F keys)
            </label>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
              placeholder="Add annotation..."
              style={{
                padding: "5px",
                marginRight: "10px",
                width: "300px",
                opacity: isQuickTagMode ? 0.5 : 1,
              }}
              disabled={isQuickTagMode}
            />
            <button
              onClick={handleAddAnnotation}
              style={{
                padding: "5px 15px",
                opacity: isQuickTagMode ? 0.5 : 1,
              }}
              disabled={isQuickTagMode}
            >
              Add
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {["a", "s", "d", "f"].map((key, index) => (
              <button
                key={key}
                id={`quick-tag-${key}`}
                onClick={() =>
                  isQuickTagMode && handleQuickTag([`tag${index + 1}`])
                }
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: isQuickTagMode
                    ? gentlePalette[index]
                    : "#ccc",
                  border: "none",
                  cursor: isQuickTagMode ? "pointer" : "default",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  transition: "transform 0.1s, background-color 0.3s",
                  opacity: isQuickTagMode ? 1 : 0.5,
                }}
                className="quick-tag-button"
                disabled={!isQuickTagMode}
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>{renderAnnotationTable}</div>
      </div>

      {editingAnnotation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", // Add semi-transparent overlay
            zIndex: 999, // Just below the editor
          }}
        >
          <AnnotationEditor
            annotation={editingAnnotation}
            onSave={handleUpdateAnnotation}
            onClose={() => setEditingAnnotation(null)}
          />
        </div>
      )}
    </div>
  );
};

export default AudioAnnotator;

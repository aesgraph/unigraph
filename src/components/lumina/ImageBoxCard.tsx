import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ImageBoxData } from '../../core/types/ImageBoxData';
import { convertWorldToScreenCoordinates } from '../../core/webgl/webglHelpers';
import ImageBoxCanvas from './ImageBoxCanvas';
import './ImageBoxCard.css'; // Import the CSS file
import { images } from './images';

interface ImageBoxProps {
  data: ImageBoxData;
  onSubmit?: (data: ImageBoxData) => void;
  style?: React.CSSProperties;
  camera: THREE.OrthographicCamera;
  canvasWidth: number;
  canvasHeight: number;
}

const ImageBoxCard: React.FC<ImageBoxProps> = ({
  data,
  onSubmit,
  style,
  camera,
  canvasWidth,
  canvasHeight,
}) => {
  const [name, setName] = useState(data.label);
  const [type, setType] = useState(data.type);
  const [description, setDescription] = useState(data.description);
  const [isEditing, setIsEditing] = useState(false);

  const topLeftScreen = convertWorldToScreenCoordinates(
    data.topLeft.x,
    data.topLeft.y,
    camera,
    canvasWidth,
    canvasHeight
  );
  const bottomRightScreen = convertWorldToScreenCoordinates(
    data.bottomRight.x,
    data.bottomRight.y,
    camera,
    canvasWidth,
    canvasHeight
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.({
      id: data.id,
      label: name,
      type,
      description,
      imageUrl: data.imageUrl,
      topLeft: data.topLeft,
      bottomRight: data.bottomRight,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(data.label);
    setType(data.type);
    setDescription(data.description);
    setIsEditing(false);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = images[data.imageUrl];
    console.log(images[image.src]);
    image.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const { topLeft, bottomRight } = data;
          const topLeftScreen = convertWorldToScreenCoordinates(
            topLeft.x,
            topLeft.y,
            camera,
            window.innerWidth,
            window.innerHeight
          );
          const bottomRightScreen = convertWorldToScreenCoordinates(
            bottomRight.x,
            bottomRight.y,
            camera,
            window.innerWidth,
            window.innerHeight
          );
          console.log(topLeft, bottomRight);
          const drawWidth = Math.abs(bottomRightScreen.x - topLeftScreen.x);
          const drawHeight = Math.abs(bottomRightScreen.y - topLeftScreen.y);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            image,
            topLeftScreen.x,
            topLeftScreen.y,
            drawWidth,
            drawHeight,
            0,
            0,
            canvas.width,
            canvas.height
          );
        }
      }
    };
  }, [camera]);

  const renderReadOnlyView = () => (
    <div className="image-box-read-only" style={style}>
      <ImageBoxCanvas imageBoxData={data} />
      <button className="edit-button" onClick={() => setIsEditing(true)}>
        Edit
      </button>
      <div>
        <strong>Name:</strong> {name}
      </div>
      <div>
        <strong>Type:</strong> {type}
      </div>
      <div>
        <strong>Description:</strong> {description}
      </div>
      <div>
        <strong>Top Left:</strong> {`(${data.topLeft.x}, ${data.topLeft.y})`}
      </div>
      <div>
        <strong>Bottom Right:</strong>{' '}
        {`(${data.bottomRight.x}, ${data.bottomRight.y})`}
      </div>
      <div>
        <strong>Top Left (Canvas):</strong>{' '}
        {`(${topLeftScreen.x}, ${topLeftScreen.y})`}
      </div>
      <div>
        <strong>Bottom Right (Canvas):</strong>{' '}
        {`(${bottomRightScreen.x}, ${bottomRightScreen.y})`}
      </div>
    </div>
  );

  const renderEditView = () => (
    <form onSubmit={handleSubmit} className="image-box-form">
      <label>
        Entity Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Type:
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="button-group">
        <button type="submit" className="submit-button">
          Submit
        </button>
        <button type="button" className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );

  return isEditing ? renderEditView() : renderReadOnlyView();
};

export default ImageBoxCard;

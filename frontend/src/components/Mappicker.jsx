import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 33.8938, // Beirut default
  lng: 35.5018,
};

const MapPicker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);

  const handleClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const location = { lat, lng };
    setPosition(location);
    onSelect(location); // send to parent
  };
const mapAPI = process.env.REACT_APP_MapAPI
return (
    <LoadScript googleMapsApiKey={mapAPI}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={handleClick}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapPicker;
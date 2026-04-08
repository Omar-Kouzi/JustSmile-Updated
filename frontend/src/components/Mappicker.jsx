import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

const center = {
  lat: 33.8938,
  lng: 35.5018,
};

const MapPicker = ({ onSelect, value }) => {
  const [position, setPosition] = useState(center);
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [confirmedLocation, setConfirmedLocation] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const searchRef = useRef(null);
  const mapRef = useRef(null);

  const mapAPI = process.env.REACT_APP_MapAPI;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: mapAPI,
    libraries: ["places"],
    version: "beta",
  });

  // LOAD SAVED LOCATION
  useEffect(() => {
    if (!value) return;

    if (value.lat && value.lng) {
      setPosition(value);
      setAddress(value.address || "");
      setSelectedLocation(value);
      setConfirmedLocation(value);

      mapRef.current?.panTo(value);
    }
  }, [value]);

  // GOOGLE SEARCH
  useEffect(() => {
    if (!isLoaded || !window.google || !fullscreen) return;

    const load = async () => {
      await window.google.maps.importLibrary("places");

      const autocomplete =
        new window.google.maps.places.PlaceAutocompleteElement();

      autocomplete.style.width = "100%";
      autocomplete.style.padding = "10px";

      autocomplete.addEventListener("gmp-placeselect", async (event) => {
        const place = event.place;

        await place.fetchFields({
          fields: ["location", "formattedAddress"],
        });

        const lat = place.location.lat();
        const lng = place.location.lng();
        const addr = place.formattedAddress;

        const loc = { lat, lng, address: addr };

        setPosition({ lat, lng });
        setAddress(addr);
        setSelectedLocation(loc);

        mapRef.current?.panTo({ lat, lng });
      });

      searchRef.current.innerHTML = "";
      searchRef.current.appendChild(autocomplete);
    };

    load();
  }, [isLoaded, fullscreen]);

  // CLICK MAP
  const handleClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addr = results[0].formatted_address;

        const loc = { lat, lng, address: addr };

        setPosition({ lat, lng });
        setAddress(addr);
        setSelectedLocation(loc);
      }
    });
  };

  // CURRENT LOCATION
  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const addr = results[0].formatted_address;

          const loc = { lat, lng, address: addr };

          setPosition({ lat, lng });
          setAddress(addr);
          setSelectedLocation(loc);

          mapRef.current?.panTo({ lat, lng });
        }
      });
    });
  };

  const confirmLocation = () => {
    if (!selectedLocation) return;

    setConfirmedLocation(selectedLocation);
    onSelect(selectedLocation);
    setFullscreen(false);
  };

  const closeMap = () => {
    if (
      selectedLocation &&
      confirmedLocation &&
      selectedLocation.lat !== confirmedLocation.lat
    ) {
      const ok = window.confirm(
        "Location not confirmed. Close anyway?"
      );

      if (!ok) return;
    }

    // revert to confirmed
    if (confirmedLocation) {
      setPosition(confirmedLocation);
      setAddress(confirmedLocation.address);
      setSelectedLocation(confirmedLocation);
    }

    setFullscreen(false);
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <>
      {/* SMALL MAP */}
      {!fullscreen && (
        <div
          style={{
            height: 250,
            borderRadius: 8,
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => setFullscreen(true)}
        >
          <GoogleMap
            mapContainerStyle={{ width: "300px", height: "300px" }}
            center={position}
            zoom={15}
            options={{
              disableDefaultUI: true,
              gestureHandling: "none",
            }}
          >
            <Marker position={position} />
          </GoogleMap>
        </div>
      )}

      {/* FULLSCREEN */}
      {fullscreen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
          }}
        >
          {/* SEARCH */}
          <div
            ref={searchRef}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              zIndex: 10,
            }}
          />

          {/* CLOSE */}
          <button
            onClick={closeMap}
            style={{
              position: "absolute",
              top: 80,
              left: 10,
              zIndex: 10,
            }}
          >
            Close Map
          </button>

          {/* CURRENT LOCATION */}
          <button
            onClick={useCurrentLocation}
            style={{
              position: "absolute",
              top: 80,
              right: 10,
              zIndex: 10,
            }}
          >
            Use Current Location
          </button>

          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={position}
            zoom={15}
            onClick={handleClick}
            onLoad={(map) => (mapRef.current = map)}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <Marker position={position} />
          </GoogleMap>

          {selectedLocation && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "var(--accent)",
                padding: 15,
                boxShadow: "0 -2px 10px rgba(0,0,0,0.15)",
              }}
            >
              <strong>Selected:</strong>
              <div>{address}</div>

              <button onClick={confirmLocation}>
                Confirm Location
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MapPicker;
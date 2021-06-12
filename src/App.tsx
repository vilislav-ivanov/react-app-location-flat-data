import React, { useState, useEffect } from 'react';
import axios from 'axios';

const url = "https://randomuser.me/api/?results=20";

interface Location {
  city: String,
  country: String,
  postalCode: String,
  state: String,
  coordinate: {
    latitude: String,
    longitude: String,
  },
  street: {
    number: Number,
    name: String
  }
}
interface FlatLocation {
  city: String,
  country: String,
  postalCode: String,
  state: String,
  latitude: String,
  longitude: String,
  streetNumber: Number,
  streetName: String
}

interface Result {
  location: Location
}

interface FetchData {
  results: Result[]
}

const flatLocations = (locations: Location[]): FlatLocation[] => {
  return locations.map(({coordinate, street, ...rest}): FlatLocation => {
    return {
      ...rest,
      streetName: street.name,
      streetNumber: street.number,
      latitude: coordinate?.latitude,
      longitude: coordinate?.longitude
    }
  })
}

function App() {
  const [locations, setLocations] = useState<FlatLocation[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get<FetchData>(url)
      const { results } = data;
      const fetchedLocations = results.map((res) => res.location);
      const flatedLocations = flatLocations(fetchedLocations);
      setLocations(flatedLocations);
    }
    fetchData();
  }, [])
  return (
    <div className="App">
      {locations.length > 0 ? (
        'Render location here'
      ) : 'No location fetched' }
    </div>
  );
}

export default App;

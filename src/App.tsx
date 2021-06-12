import React, { useState, useEffect } from 'react';
import axios from 'axios';

const url = "https://randomuser.me/api/?results=20";

interface Location {
  city: String,
  country: String,
  postcode: String,
  state: String,
  coordinates: {
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
  postcode: String,
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
  return locations.map(({coordinates, street, city, country, postcode, state}): FlatLocation => {
    return {
      city,
      country,
      postcode,
      state,
      streetName: street.name,
      streetNumber: street.number,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
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

  const mapLocationToTableData = (location: FlatLocation) => {
    return Object.values(location).map((locationValue, locationIdx) => {
      if (typeof locationValue !== 'object') {
        return <td key={locationIdx}>{locationValue}</td>
      } else {
        return null;
      }
    })
  }

  const mapLocationsToTable = (locations: FlatLocation[]) => {
    return (
      <table>
        <thead><tr>{Object.keys(locations[0]).map((locationKey, locationIdx) => {
          return (<th key={locationIdx}>{locationKey}</th>)
        })}</tr></thead>
        <tbody>
          {
          locations.map((location, locationIdx) => {
            return (
              <tr key={locationIdx}>{mapLocationToTableData(location)}</tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  return (
    <div className="App">
      {locations.length > 0 ? (
        mapLocationsToTable(locations)
        ) : 'No location fetched' }
    </div>
  );
}

export default App;

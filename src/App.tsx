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

enum SortOptions {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  UNSORTED = 'UNSORTED'
}

const flatLocations = (locations: Location[]): FlatLocation[] => {
  return locations.map(({ coordinates, street, city, country, postcode, state }): FlatLocation => {
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

interface MapLocationToSortOption {
  [key: string]: SortOptions
}

function App() {
  const [locations, setLocations] = useState<FlatLocation[]>([]);
  const [defaultLocations, setDefaultLocations] = useState<FlatLocation[]>([]);
  // {street: SortOptions.UNSORTED, ...}
  const [mapLocationToSortOption, setMapLocationToSortOption] = useState<MapLocationToSortOption>({})

  useEffect(() => {
    const fetchLocation = async () => {
      const { data } = await axios.get<FetchData>(url)
      const { results } = data;
      const fetchedLocations = results.map((res) => res.location);
      return fetchedLocations;
    }
    fetchLocation().then(fetchedLocations => {
      const flatedLocations = flatLocations(fetchedLocations);
      setLocations(flatedLocations);
      setDefaultLocations(flatedLocations);
      const initialLocationSortOption: MapLocationToSortOption = {}

      for (const locationKey in flatedLocations[0]) {
        initialLocationSortOption[locationKey] = SortOptions.UNSORTED;
      }

      setMapLocationToSortOption(initialLocationSortOption);
    });
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

  const onTableHeaderClickHandler = (field: (keyof FlatLocation)) => {
    // sort location by field on ascending/descending/default
    let updatedLocations = [...locations]
    const updateMapLocationToSortOption = { ...mapLocationToSortOption };

    if (mapLocationToSortOption[field] === SortOptions.DESCENDING) {
      // Change to unsorted & load default location unsorted

      updateMapLocationToSortOption[field] = SortOptions.UNSORTED;
      setMapLocationToSortOption(updateMapLocationToSortOption)
      setLocations(defaultLocations);
      return;
    }

    updatedLocations = updatedLocations.sort((a, b) => {
      if (a[field] > b[field]) {
        if (mapLocationToSortOption[field] === SortOptions.UNSORTED) {
          updateMapLocationToSortOption[field] = SortOptions.ASCENDING;
          setMapLocationToSortOption(updateMapLocationToSortOption)
          return 1;
        }
        if (mapLocationToSortOption[field] === SortOptions.ASCENDING) {
          updateMapLocationToSortOption[field] = SortOptions.DESCENDING;
          setMapLocationToSortOption(updateMapLocationToSortOption)
          return -1
        }
      }
      if (a[field] < b[field]) {
        if (mapLocationToSortOption[field] === SortOptions.UNSORTED || mapLocationToSortOption[field] === SortOptions.DESCENDING) {
          return -1;
        } else {
          return 1
        }
      }
      return 0
    })
    setLocations(updatedLocations);
  }

  const mapLocationsToTable = (locations: FlatLocation[]) => {
    return (
      <table>
        <thead><tr>{Object.keys(locations[0]).map((locationKey, locationIdx) => {
          return (<th onClick={() => onTableHeaderClickHandler(locationKey as (keyof FlatLocation))} key={locationIdx}>{locationKey}</th>)
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
      ) : 'No location fetched'}
    </div>
  );
}

export default App;

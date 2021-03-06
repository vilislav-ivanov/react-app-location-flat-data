



import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

import './App.css';

const url = "https://randomuser.me/api/?results=20";

interface Location {
  city: string,
  country: string,
  postcode: string,
  state: string,
  coordinates: {
    latitude: string,
    longitude: string,
  },
  street: {
    number: Number,
    name: string
  }
}
interface FlatLocation {
  id: string,
  city: string,
  country: string,
  postcode: string,
  state: string,
  latitude: string,
  longitude: string,
  streetNumber: Number,
  streetName: string
}

interface Result {
  location: Location
}

interface FetchData {
  results: Result[]
}

enum SortOption {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
  UNSORTED = 'UNSORTED'
}

const flatLocations = (locations: Location[]): FlatLocation[] => {
  return locations.map(({ coordinates, street, city, country, postcode, state }): FlatLocation => {
    return {
      id: uuid(),
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
  [key: string]: SortOption
}

interface MapLocationToFoundOnSearch {
  [key: string]: boolean
}

function App() {
  const [locations, setLocations] = useState<FlatLocation[]>([]);
  const [filteredLcations, setFilteredLocations] = useState<FlatLocation[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [defaultLocations, setDefaultLocations] = useState<FlatLocation[]>([]);
  // mapLocationToSortOption = {street: SortOption.UNSORTED, ...}
  const [mapLocationToSortOption, setMapLocationToSortOption] = useState<MapLocationToSortOption>({})
  // mapLocationToFoundOnSearch = { locationId: true/false }
  const [mapLocationToFoundOnSearch, setMapLocationToFoundOnSearch] = useState<MapLocationToFoundOnSearch>({})

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
      const initialLocationSortOption: MapLocationToSortOption = {};
      const initialLocationToFoundOnSearch: MapLocationToFoundOnSearch = {};

      for (const locationKey in flatedLocations[0]) {
        initialLocationSortOption[locationKey] = SortOption.UNSORTED;
      }

      for (const location of flatedLocations) {
        initialLocationToFoundOnSearch[location.id] = false;
      }

      setMapLocationToSortOption(initialLocationSortOption);
      setMapLocationToFoundOnSearch(initialLocationToFoundOnSearch);
    });
  }, [])

  const handleTableFieldClicked = (field: (keyof FlatLocation)) => {
    // sort location by field on ascending/descending/default
    let updatedLocations = [...locations];
    let updatedFilteredLocations = [...filteredLcations] || [];
    const updatedMapLocationToSortOption = { ...mapLocationToSortOption };

    if (mapLocationToSortOption[field] === SortOption.DESCENDING) {
      // Change to unsorted & load default location unsorted

      updatedMapLocationToSortOption[field] = SortOption.UNSORTED;
      updatedLocations = defaultLocations;
    }

    if (mapLocationToSortOption[field] === SortOption.UNSORTED) {
      // previeous sort was unsorted so next is ascending
      updatedMapLocationToSortOption[field] = SortOption.ASCENDING;

      updatedLocations = sortLocations(updatedLocations, field, SortOption.ASCENDING)
      updatedFilteredLocations = sortLocations(updatedFilteredLocations, field, SortOption.ASCENDING)
    } 
    if ((mapLocationToSortOption[field] === SortOption.ASCENDING)) {
      // previeous sort was ascending so next is descending
      updatedMapLocationToSortOption[field] = SortOption.DESCENDING;

      updatedLocations = sortLocations(updatedLocations, field, SortOption.DESCENDING)
      updatedFilteredLocations = sortLocations(updatedFilteredLocations, field, SortOption.DESCENDING)
    }

    setMapLocationToSortOption(updatedMapLocationToSortOption)
    setLocations(updatedLocations);
    setFilteredLocations(updatedFilteredLocations);
  }

  const sortLocations = (locations: FlatLocation[], field: (keyof FlatLocation), sortOption: SortOption) => {
    let updatedLocations = [...locations]
    updatedLocations = updatedLocations.sort((a, b) => {
      if (a[field] > b[field]) {
        if (sortOption === SortOption.ASCENDING) {
          return 1;
        }
        if (sortOption === SortOption.DESCENDING) {
          return -1;
        }
      }
      if (a[field] < b[field]) {
        if (sortOption === SortOption.ASCENDING) {
          return -1;
        }
        if (sortOption === SortOption.DESCENDING) {
          return 1;
        }
      }
      return 0;
    })
    return updatedLocations;
  }

  const mapLocationToTableData = (location: FlatLocation) => {
    return Object.values(location).map((locationValue, locationIdx) => {
      if (typeof locationValue !== 'object') {
        return <td key={locationIdx}>{locationValue}</td>
      } else {
        return null;
      }
    })
  }

  const mapLocationsToTableElement = (locations: FlatLocation[]) => {
    return (
      <table>
        <thead><tr>{Object.keys(locations[0]).map((locationKey, locationIdx) => {
          return (<th onClick={() => handleTableFieldClicked(locationKey as (keyof FlatLocation))} key={locationIdx}>{locationKey}</th>)
        })}</tr></thead>
        <tbody>
          {
            locations.map((location, locationIdx) => {
              const className = mapLocationToFoundOnSearch[location.id] ? 'colored' : '';
              return (
                <tr className={className} key={locationIdx}>{mapLocationToTableData(location)}</tr>
              )
            })}
        </tbody>
      </table>
    )
  }

  const handleSearchValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    filterLocation(value);
  }

  const filterLocation = (search: string) => {
    const updatedFilteredLocations: FlatLocation[] = [];
    const updatedMapLocationToFoundOnSearch: MapLocationToFoundOnSearch = {};

    locations.forEach(location => {
      Object.values(location).forEach((value) => {
        if (typeof value === 'string' && value.includes(search)) {
          if (
            !updatedFilteredLocations.find(fl => fl === location)
            && !updatedMapLocationToFoundOnSearch[location.id]
            && search.length > 0
          ) {
            updatedFilteredLocations.push(location);
            updatedMapLocationToFoundOnSearch[location.id] = true;
          }
        }
        setFilteredLocations(updatedFilteredLocations);
      })
      setMapLocationToFoundOnSearch(updatedMapLocationToFoundOnSearch);
    })

  }

  return (
    <div>
      <div className="App">
        <div className="filter">
          <input type="text" name="search" value={searchValue} onChange={handleSearchValueChange} />
          <p className="display-filter">Searching for: {searchValue}</p>
        </div>
        {filteredLcations.length > 0 && searchValue.length > 0 ? (
          // mapLocationsToTableElement(filteredLcations)
          mapLocationsToTableElement(locations)
        ) : locations.length > 0 ? (
          mapLocationsToTableElement(locations)
        ) : 'No location fetched'}
      </div>
    </div>
  );
}

export default App;

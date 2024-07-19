import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({baseUrl: 'http://10.54.1.30:8640'}),
  tagTypes: ['HydroStorm'],
  endpoints: (builder)=>({
    saveHydroStorm: builder.query({
      query: ()=>'http://localhost:3001/conservations/save_hydro_storm',
      providesTags: ['HydroStorm']
    })
  }),
})

export const {useSaveHydroStormQurey} = apiSlice
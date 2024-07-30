import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({baseUrl: 'http://10.54.1.30:8640'}),
  tagTypes: ['HydroStorm'],
  endpoints: (builder)=>({
    saveHydroStorm: builder.query({
      query: (hydroData)=>{
        let s=''
        let url = window.location.href
        let ipAddress = ((url.indexOf('localhost')>-1) || (url.indexOf('//10.54')>-1))? '10.54.1.11:8083':'31.133.32.14:8083'
        Object.keys(hydroData).forEach(key=>{s+=`${key}=${hydroData[key]}&`})
        // return `http://${ipAddress}/conservations/save_hydro_storm?node=no-cors&${s.slice(0,-1)}`
        return `http://localhost:3000/conservations/save_hydro_storm?mode=opaque&${s.slice(0,-1)}`
      },
      providesTags: ['HydroStorm']
    })
  }),
})

export const {useSaveHydroStormQuery} = apiSlice
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { logout, setCredentials } from "@/features/auth/authSlice"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1"

const toFormData = (values) => {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    if (Array.isArray(value)) value.forEach((item) => formData.append(key, item))
    else formData.append(key, value)
  })
  return formData
}

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken
      if (token) headers.set("authorization", `Bearer ${token}`)
      return headers
    },
  })

const baseQueryWithRefresh = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      )

      if (refreshResult.data?.data?.accessToken) {
        api.dispatch(
          setCredentials({
            account: api.getState().auth.account,
            refreshToken,
            accessToken: refreshResult.data.data.accessToken,
          }),
        )
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Auth", "Vendors", "VendorDashboard", "Bookings", "Wallet"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Auth"],
    }),
    signupUser: builder.mutation({
      query: (body) => ({ url: "/auth/signup/user", method: "POST", body }),
      transformResponse: (response) => response.data,
    }),
    signupVendor: builder.mutation({
      query: (body) => ({ url: "/auth/signup/vendor", method: "POST", body: toFormData(body) }),
      transformResponse: (response) => response,
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      transformResponse: (response) => response.data,
      providesTags: ["Auth"],
    }),
    updateMe: builder.mutation({
      query: (body) => ({ url: "/auth/me", method: "PATCH", body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Auth"],
    }),
    updateMyProfileImage: builder.mutation({
      query: (body) => ({ url: "/auth/me/image", method: "PATCH", body: toFormData(body) }),
      invalidatesTags: ["Auth"],
    }),
    sendUserSupportMessage: builder.mutation({
      query: (body) => ({ url: "/auth/me/support-message", method: "POST", body }),
    }),
    getVendors: builder.query({
      query: (params = {}) => ({ url: "/vendors", params }),
      transformResponse: (response) => response.data,
      providesTags: ["Vendors"],
    }),
    getVendor: builder.query({
      query: (id) => `/vendors/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Vendors", id }],
    }),
    getVendorDashboard: builder.query({
      query: () => "/vendors/dashboard",
      transformResponse: (response) => response.data,
      providesTags: ["VendorDashboard"],
    }),
    addVendorService: builder.mutation({
      query: (body) => ({ url: "/vendors/services", method: "POST", body: toFormData(body) }),
      invalidatesTags: ["VendorDashboard", "Vendors"],
    }),
    updateVendorProfile: builder.mutation({
      query: (body) => ({ url: "/vendors/profile", method: "PATCH", body }),
      invalidatesTags: ["VendorDashboard", "Auth"],
    }),
    updateVendorProfileImage: builder.mutation({
      query: (body) => ({ url: "/vendors/profile/image", method: "PATCH", body: toFormData(body) }),
      invalidatesTags: ["VendorDashboard", "Auth", "Vendors"],
    }),
    addBankAccount: builder.mutation({
      query: (body) => ({ url: "/vendors/bank-accounts", method: "POST", body }),
      invalidatesTags: ["VendorDashboard", "Wallet"],
    }),
    sendVendorSupportMessage: builder.mutation({
      query: (body) => ({ url: "/vendors/support-message", method: "POST", body }),
    }),
    getVendorBookings: builder.query({
      query: () => "/vendors/dashboard/bookings",
      transformResponse: (response) => response.data,
      providesTags: ["Bookings"],
    }),
    confirmBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/vendor-confirm`, method: "PATCH" }),
      invalidatesTags: ["Bookings", "VendorDashboard"],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/vendor-cancel`, method: "PATCH" }),
      invalidatesTags: ["Bookings", "VendorDashboard"],
    }),
    completeBooking: builder.mutation({
      query: (id) => ({ url: `/bookings/${id}/complete`, method: "PATCH" }),
      invalidatesTags: ["Bookings", "VendorDashboard", "Wallet"],
    }),
    getMyBookings: builder.query({
      query: () => "/bookings/mine",
      transformResponse: (response) => response.data,
      providesTags: ["Bookings"],
    }),
    createAdvanceOrder: builder.mutation({
      query: (body) => ({ url: "/bookings/advance-order", method: "POST", body }),
    }),
    createUpiAdvanceBooking: builder.mutation({
      query: (body) => ({ url: "/bookings/upi-advance", method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    verifyAdvancePayment: builder.mutation({
      query: ({ serviceId, ...body }) => ({ url: `/bookings/${serviceId}/verify-advance`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    createRemainingOrder: builder.mutation({
      query: (bookingId) => ({ url: `/bookings/${bookingId}/remaining-order`, method: "POST" }),
    }),
    verifyRemainingPayment: builder.mutation({
      query: ({ bookingId, ...body }) => ({ url: `/bookings/${bookingId}/verify-remaining`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    confirmUpiRemainingPayment: builder.mutation({
      query: ({ bookingId, ...body }) => ({ url: `/bookings/${bookingId}/upi-remaining`, method: "POST", body }),
      invalidatesTags: ["Bookings"],
    }),
    getWallet: builder.query({
      query: () => "/wallet",
      transformResponse: (response) => response.data,
      providesTags: ["Wallet"],
    }),
    requestWithdrawal: builder.mutation({
      query: (body) => ({ url: "/wallet/withdraw", method: "POST", body }),
      invalidatesTags: ["Wallet", "VendorDashboard"],
    }),
    getAdminVendors: builder.query({
      query: () => "/admin/vendors",
      transformResponse: (response) => response.data,
      providesTags: ["Vendors"],
    }),
    approveVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/approve`, method: "PATCH" }),
      invalidatesTags: ["Vendors"],
    }),
    rejectVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/reject`, method: "PATCH" }),
      invalidatesTags: ["Vendors"],
    }),
    suspendVendor: builder.mutation({
      query: (id) => ({ url: `/admin/vendors/${id}/suspend`, method: "PATCH" }),
      invalidatesTags: ["Vendors"],
    }),
  }),
})

export const {
  useLoginMutation,
  useSignupUserMutation,
  useSignupVendorMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdateMyProfileImageMutation,
  useSendUserSupportMessageMutation,
  useGetVendorsQuery,
  useGetVendorQuery,
  useGetVendorDashboardQuery,
  useAddVendorServiceMutation,
  useUpdateVendorProfileMutation,
  useUpdateVendorProfileImageMutation,
  useAddBankAccountMutation,
  useSendVendorSupportMessageMutation,
  useGetVendorBookingsQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useCompleteBookingMutation,
  useGetMyBookingsQuery,
  useCreateAdvanceOrderMutation,
  useCreateUpiAdvanceBookingMutation,
  useVerifyAdvancePaymentMutation,
  useCreateRemainingOrderMutation,
  useVerifyRemainingPaymentMutation,
  useConfirmUpiRemainingPaymentMutation,
  useGetWalletQuery,
  useRequestWithdrawalMutation,
  useGetAdminVendorsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useSuspendVendorMutation,
} = apiSlice

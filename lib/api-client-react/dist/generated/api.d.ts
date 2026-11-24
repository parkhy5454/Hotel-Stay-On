import type { DataTag, DefinedInitialDataOptions, DefinedUseQueryResult, QueryClient, QueryKey, UndefinedInitialDataOptions, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { BookingConfirmation, BookingInput, BookingStatusInput, HealthStatus, ListStaysParams, PartnerBooking, PartnerInput, PartnerProfile, PartnerStay, PartnerStayInput, PartnerStayUpdate, RoomInput, RoomType, RoomUpdate, StayDetail, StaySummary } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof healthCheck>>, TError, Awaited<ReturnType<typeof healthCheck>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof healthCheck>>, TError, Awaited<ReturnType<typeof healthCheck>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getListStaysUrl: (params?: ListStaysParams) => string;
/**
 * @summary Search listed stays
 */
export declare const listStays: (params?: ListStaysParams, options?: Parameters<typeof customFetch>[1]) => Promise<StaySummary[]>;
export declare const getListStaysQueryKey: (params?: ListStaysParams) => readonly ["/api/stays", ...ListStaysParams[]];
export declare const getListStaysQueryOptions: <TData = Awaited<ReturnType<typeof listStays>>, TError = ErrorType<unknown>>(params?: ListStaysParams, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listStays>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listStays>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type ListStaysQueryResult = NonNullable<Awaited<ReturnType<typeof listStays>>>;
export type ListStaysQueryError = ErrorType<unknown>;
export declare function useListStays<TData = Awaited<ReturnType<typeof listStays>>, TError = ErrorType<unknown>>(params: undefined | ListStaysParams, options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof listStays>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof listStays>>, TError, Awaited<ReturnType<typeof listStays>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useListStays<TData = Awaited<ReturnType<typeof listStays>>, TError = ErrorType<unknown>>(params?: ListStaysParams, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listStays>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof listStays>>, TError, Awaited<ReturnType<typeof listStays>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useListStays<TData = Awaited<ReturnType<typeof listStays>>, TError = ErrorType<unknown>>(params?: ListStaysParams, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listStays>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getGetStayUrl: (id: number) => string;
/**
 * @summary Get stay details
 */
export declare const getStay: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<StayDetail>;
export declare const getGetStayQueryKey: (id: number) => readonly [`/api/stays/${number}`];
export declare const getGetStayQueryOptions: <TData = Awaited<ReturnType<typeof getStay>>, TError = ErrorType<void>>(id: number, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getStay>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStay>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type GetStayQueryResult = NonNullable<Awaited<ReturnType<typeof getStay>>>;
export type GetStayQueryError = ErrorType<void>;
export declare function useGetStay<TData = Awaited<ReturnType<typeof getStay>>, TError = ErrorType<void>>(id: number, options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getStay>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof getStay>>, TError, Awaited<ReturnType<typeof getStay>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useGetStay<TData = Awaited<ReturnType<typeof getStay>>, TError = ErrorType<void>>(id: number, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getStay>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof getStay>>, TError, Awaited<ReturnType<typeof getStay>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useGetStay<TData = Awaited<ReturnType<typeof getStay>>, TError = ErrorType<void>>(id: number, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getStay>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getCreateBookingUrl: () => string;
/**
 * @summary Create a reservation request
 */
export declare const createBooking: (bookingInput: BookingInput, options?: Parameters<typeof customFetch>[1]) => Promise<BookingConfirmation>;
export declare const getCreateBookingMutationKey: () => readonly ["createBooking"];
export declare const getCreateBookingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, CreateBookingMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, CreateBookingMutationVariables, TContext>;
export type CreateBookingMutationResult = NonNullable<Awaited<ReturnType<typeof createBooking>>>;
export type CreateBookingMutationBody = BodyType<BookingInput>;
export type CreateBookingMutationError = ErrorType<void>;
export type CreateBookingMutationVariables = {
    data: BodyType<BookingInput>;
};
/**
* @summary Create a reservation request
*/
export declare const useCreateBooking: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBooking>>, TError, CreateBookingMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof createBooking>>, TError, CreateBookingMutationVariables, TContext>;
export declare const getGetBookingUrl: (code: string) => string;
/**
 * @summary Look up a reservation by confirmation code
 */
export declare const getBooking: (code: string, options?: Parameters<typeof customFetch>[1]) => Promise<BookingConfirmation>;
export declare const getGetBookingQueryKey: (code: string) => readonly [`/api/bookings/${string}`];
export declare const getGetBookingQueryOptions: <TData = Awaited<ReturnType<typeof getBooking>>, TError = ErrorType<void>>(code: string, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type GetBookingQueryResult = NonNullable<Awaited<ReturnType<typeof getBooking>>>;
export type GetBookingQueryError = ErrorType<void>;
export declare function useGetBooking<TData = Awaited<ReturnType<typeof getBooking>>, TError = ErrorType<void>>(code: string, options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof getBooking>>, TError, Awaited<ReturnType<typeof getBooking>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useGetBooking<TData = Awaited<ReturnType<typeof getBooking>>, TError = ErrorType<void>>(code: string, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof getBooking>>, TError, Awaited<ReturnType<typeof getBooking>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useGetBooking<TData = Awaited<ReturnType<typeof getBooking>>, TError = ErrorType<void>>(code: string, options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getBooking>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getRegisterPartnerUrl: () => string;
/**
 * @summary Register a hotel or motel partner
 */
export declare const registerPartner: (partnerInput: PartnerInput, options?: Parameters<typeof customFetch>[1]) => Promise<PartnerProfile>;
export declare const getRegisterPartnerMutationKey: () => readonly ["registerPartner"];
export declare const getRegisterPartnerMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerPartner>>, TError, RegisterPartnerMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerPartner>>, TError, RegisterPartnerMutationVariables, TContext>;
export type RegisterPartnerMutationResult = NonNullable<Awaited<ReturnType<typeof registerPartner>>>;
export type RegisterPartnerMutationBody = BodyType<PartnerInput>;
export type RegisterPartnerMutationError = ErrorType<void>;
export type RegisterPartnerMutationVariables = {
    data: BodyType<PartnerInput>;
};
/**
* @summary Register a hotel or motel partner
*/
export declare const useRegisterPartner: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerPartner>>, TError, RegisterPartnerMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof registerPartner>>, TError, RegisterPartnerMutationVariables, TContext>;
export declare const getGetPartnerProfileUrl: () => string;
/**
 * @summary Get the signed-in partner profile
 */
export declare const getPartnerProfile: (options?: Parameters<typeof customFetch>[1]) => Promise<PartnerProfile>;
export declare const getGetPartnerProfileQueryKey: () => readonly ["/api/partner/me"];
export declare const getGetPartnerProfileQueryOptions: <TData = Awaited<ReturnType<typeof getPartnerProfile>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type GetPartnerProfileQueryResult = NonNullable<Awaited<ReturnType<typeof getPartnerProfile>>>;
export type GetPartnerProfileQueryError = ErrorType<void>;
export declare function useGetPartnerProfile<TData = Awaited<ReturnType<typeof getPartnerProfile>>, TError = ErrorType<void>>(options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, Awaited<ReturnType<typeof getPartnerProfile>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useGetPartnerProfile<TData = Awaited<ReturnType<typeof getPartnerProfile>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, Awaited<ReturnType<typeof getPartnerProfile>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useGetPartnerProfile<TData = Awaited<ReturnType<typeof getPartnerProfile>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getPartnerProfile>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getListPartnerStaysUrl: () => string;
/**
 * @summary List the partner's stays and room types
 */
export declare const listPartnerStays: (options?: Parameters<typeof customFetch>[1]) => Promise<PartnerStay[]>;
export declare const getListPartnerStaysQueryKey: () => readonly ["/api/partner/stays"];
export declare const getListPartnerStaysQueryOptions: <TData = Awaited<ReturnType<typeof listPartnerStays>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type ListPartnerStaysQueryResult = NonNullable<Awaited<ReturnType<typeof listPartnerStays>>>;
export type ListPartnerStaysQueryError = ErrorType<void>;
export declare function useListPartnerStays<TData = Awaited<ReturnType<typeof listPartnerStays>>, TError = ErrorType<void>>(options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, Awaited<ReturnType<typeof listPartnerStays>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useListPartnerStays<TData = Awaited<ReturnType<typeof listPartnerStays>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, Awaited<ReturnType<typeof listPartnerStays>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useListPartnerStays<TData = Awaited<ReturnType<typeof listPartnerStays>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerStays>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getCreatePartnerStayUrl: () => string;
/**
 * @summary Create a stay and initial room type
 */
export declare const createPartnerStay: (partnerStayInput: PartnerStayInput, options?: Parameters<typeof customFetch>[1]) => Promise<PartnerStay>;
export declare const getCreatePartnerStayMutationKey: () => readonly ["createPartnerStay"];
export declare const getCreatePartnerStayMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPartnerStay>>, TError, CreatePartnerStayMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPartnerStay>>, TError, CreatePartnerStayMutationVariables, TContext>;
export type CreatePartnerStayMutationResult = NonNullable<Awaited<ReturnType<typeof createPartnerStay>>>;
export type CreatePartnerStayMutationBody = BodyType<PartnerStayInput>;
export type CreatePartnerStayMutationError = ErrorType<void>;
export type CreatePartnerStayMutationVariables = {
    data: BodyType<PartnerStayInput>;
};
/**
* @summary Create a stay and initial room type
*/
export declare const useCreatePartnerStay: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPartnerStay>>, TError, CreatePartnerStayMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof createPartnerStay>>, TError, CreatePartnerStayMutationVariables, TContext>;
export declare const getUpdatePartnerStayUrl: (id: number) => string;
/**
 * @summary Update a stay or its room details
 */
export declare const updatePartnerStay: (id: number, partnerStayUpdate: PartnerStayUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<PartnerStay>;
export declare const getUpdatePartnerStayMutationKey: () => readonly ["updatePartnerStay"];
export declare const getUpdatePartnerStayMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePartnerStay>>, TError, UpdatePartnerStayMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePartnerStay>>, TError, UpdatePartnerStayMutationVariables, TContext>;
export type UpdatePartnerStayMutationResult = NonNullable<Awaited<ReturnType<typeof updatePartnerStay>>>;
export type UpdatePartnerStayMutationBody = BodyType<PartnerStayUpdate>;
export type UpdatePartnerStayMutationError = ErrorType<void>;
export type UpdatePartnerStayMutationVariables = {
    id: number;
    data: BodyType<PartnerStayUpdate>;
};
/**
* @summary Update a stay or its room details
*/
export declare const useUpdatePartnerStay: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePartnerStay>>, TError, UpdatePartnerStayMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof updatePartnerStay>>, TError, UpdatePartnerStayMutationVariables, TContext>;
export declare const getCreatePartnerRoomUrl: (id: number) => string;
/**
 * @summary Add a room type to a partner's stay
 */
export declare const createPartnerRoom: (id: number, roomInput: RoomInput, options?: Parameters<typeof customFetch>[1]) => Promise<RoomType>;
export declare const getCreatePartnerRoomMutationKey: () => readonly ["createPartnerRoom"];
export declare const getCreatePartnerRoomMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPartnerRoom>>, TError, CreatePartnerRoomMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPartnerRoom>>, TError, CreatePartnerRoomMutationVariables, TContext>;
export type CreatePartnerRoomMutationResult = NonNullable<Awaited<ReturnType<typeof createPartnerRoom>>>;
export type CreatePartnerRoomMutationBody = BodyType<RoomInput>;
export type CreatePartnerRoomMutationError = ErrorType<void>;
export type CreatePartnerRoomMutationVariables = {
    id: number;
    data: BodyType<RoomInput>;
};
/**
* @summary Add a room type to a partner's stay
*/
export declare const useCreatePartnerRoom: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPartnerRoom>>, TError, CreatePartnerRoomMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof createPartnerRoom>>, TError, CreatePartnerRoomMutationVariables, TContext>;
export declare const getUpdatePartnerRoomUrl: (id: number) => string;
/**
 * @summary Update room price, capacity, inventory, or amenities
 */
export declare const updatePartnerRoom: (id: number, roomUpdate: RoomUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<RoomType>;
export declare const getUpdatePartnerRoomMutationKey: () => readonly ["updatePartnerRoom"];
export declare const getUpdatePartnerRoomMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePartnerRoom>>, TError, UpdatePartnerRoomMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePartnerRoom>>, TError, UpdatePartnerRoomMutationVariables, TContext>;
export type UpdatePartnerRoomMutationResult = NonNullable<Awaited<ReturnType<typeof updatePartnerRoom>>>;
export type UpdatePartnerRoomMutationBody = BodyType<RoomUpdate>;
export type UpdatePartnerRoomMutationError = ErrorType<void>;
export type UpdatePartnerRoomMutationVariables = {
    id: number;
    data: BodyType<RoomUpdate>;
};
/**
* @summary Update room price, capacity, inventory, or amenities
*/
export declare const useUpdatePartnerRoom: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePartnerRoom>>, TError, UpdatePartnerRoomMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof updatePartnerRoom>>, TError, UpdatePartnerRoomMutationVariables, TContext>;
export declare const getListPartnerBookingsUrl: () => string;
/**
 * @summary View reservation requests for the partner's stays
 */
export declare const listPartnerBookings: (options?: Parameters<typeof customFetch>[1]) => Promise<PartnerBooking[]>;
export declare const getListPartnerBookingsQueryKey: () => readonly ["/api/partner/bookings"];
export declare const getListPartnerBookingsQueryOptions: <TData = Awaited<ReturnType<typeof listPartnerBookings>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, TData> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export type ListPartnerBookingsQueryResult = NonNullable<Awaited<ReturnType<typeof listPartnerBookings>>>;
export type ListPartnerBookingsQueryError = ErrorType<void>;
export declare function useListPartnerBookings<TData = Awaited<ReturnType<typeof listPartnerBookings>>, TError = ErrorType<void>>(options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, TData>> & Pick<DefinedInitialDataOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, Awaited<ReturnType<typeof listPartnerBookings>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): DefinedUseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useListPartnerBookings<TData = Awaited<ReturnType<typeof listPartnerBookings>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, TData>> & Pick<UndefinedInitialDataOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, Awaited<ReturnType<typeof listPartnerBookings>>>, 'initialData'>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare function useListPartnerBookings<TData = Awaited<ReturnType<typeof listPartnerBookings>>, TError = ErrorType<void>>(options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof listPartnerBookings>>, TError, TData>>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient): UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData, TError>;
};
export declare const getUpdatePartnerBookingUrl: (id: number) => string;
/**
 * @summary Confirm or cancel a reservation request
 */
export declare const updatePartnerBooking: (id: number, bookingStatusInput: BookingStatusInput, options?: Parameters<typeof customFetch>[1]) => Promise<PartnerBooking>;
export declare const getUpdatePartnerBookingMutationKey: () => readonly ["updatePartnerBooking"];
export declare const getUpdatePartnerBookingMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePartnerBooking>>, TError, UpdatePartnerBookingMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePartnerBooking>>, TError, UpdatePartnerBookingMutationVariables, TContext>;
export type UpdatePartnerBookingMutationResult = NonNullable<Awaited<ReturnType<typeof updatePartnerBooking>>>;
export type UpdatePartnerBookingMutationBody = BodyType<BookingStatusInput>;
export type UpdatePartnerBookingMutationError = ErrorType<void>;
export type UpdatePartnerBookingMutationVariables = {
    id: number;
    data: BodyType<BookingStatusInput>;
};
/**
* @summary Confirm or cancel a reservation request
*/
export declare const useUpdatePartnerBooking: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePartnerBooking>>, TError, UpdatePartnerBookingMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}, queryClient?: QueryClient) => UseMutationResult<Awaited<ReturnType<typeof updatePartnerBooking>>, TError, UpdatePartnerBookingMutationVariables, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map
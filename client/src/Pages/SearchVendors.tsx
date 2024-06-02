import { useEffect, useState } from "react"
import { search } from "@/api"
import { VendorSaveType, VendorSearchType } from "@/definitions"
import VendorCard from "@/components/VendorCard"
import { useEventContext } from "@/context/EventContext"
import { Skeleton } from "@/components/ui/skeleton"

const SearchVendors = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [vendors, setVendors] = useState<VendorSaveType[]>([])
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  const [loadingSearch, setLoadingSearch] = useState(true)

  const { event, loadingEvent } = useEventContext()

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value)
  }
  useEffect(() => {
    const fetchData = async () => {
      setLoadingSearch(true)
      search(searchQuery, "vendor", 1, 20)
        .then((response: { data: { vendors: VendorSearchType[] } }) => {
          // console.log(response.data)

          setVendors(() =>
            response.data.vendors
              .map((vendor) =>
                vendor.servicesData.map((service) => ({
                  vendorUserId: vendor.userId,
                  vendorProfileId: vendor._id,
                  vendorName: vendor.name,
                  vendorProfileImage: vendor.profileImage,
                  vendorEmail: vendor.email,
                  vendorPhoneNo: vendor.phoneNo,
                  servicesOffering: service,
                })),
              )
              .flat()
              .filter((vendor) => {
                return vendor.servicesOffering.serviceName
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              }),
          )
        })
        .catch((error) => console.error(error.response))
        .finally(() => setLoadingSearch(false))
    }

    if (timeoutId) clearTimeout(timeoutId)
    const id = setTimeout(fetchData, 1500)
    setTimeoutId(id)
  }, [searchQuery])

  if (loadingEvent) return <div>Loading...</div>
  if (!event) return <div>No Event Found</div>

  const displayVendors = vendors

  return (
    <div>
      <div className="px-4 divide-y space-y-2">
        <div className="pt-2">
          <div className="font-semibold text-gray-800 px-2 text-xl">
            Search Vendors
          </div>
          <div className="flex flex-col gap-2 py-2">
            {/* Search input */}
            <input
              type="text"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search services..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {
            // Loading spinner
            loadingSearch ? (
              <div className="flex justify-center flex-col md:flex-row space-y-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
            ) : displayVendors.length === 0 ? (
              <div className="text-center text-gray-500">No Vendors Found</div>
            ) : (
              displayVendors.map((vendor) => (
                <VendorCard key={vendor.servicesOffering._id} vendor={vendor} />
              ))
            )
          }
        </div>
      </div>
    </div>
  )
}

export default SearchVendors

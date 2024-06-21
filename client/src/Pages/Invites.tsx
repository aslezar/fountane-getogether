import { useAppSelector } from "@/hooks"
import ServiceNotificationCard from "@/components/ServiceNotificationCard"
import GuestNotificationCard from "@/components/GuestNotificationCard"

const Invites = () => {
  const { user } = useAppSelector((state) => state.user)
  const notifications = user?.notifications || []

  const guestNotifications = notifications.filter(
    (notification) => notification.userList !== undefined,
  )

  const serviceNotifications = notifications
    .map((notification) => {
      return {
        serviceList: notification.serviceList,
        eventId: notification._id,
        eventName: notification.name,
        host: notification.host,
      }
    })
    .flat()

  return (
    <div className="lg:w-5/6 mx-auto bg-white my-4 p-5 rounded-2xl border shadow-sm">
      <div className="text-2xl px-5 my-2 font-medium text-zinc-800 ">
        Your Invites
      </div>
      <div className=" px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guestNotifications.length === 0 &&
          serviceNotifications.length === 0 && (
            <span>You don't have any invites yet</span>
          )}
        {guestNotifications.map((invite) => (
          <GuestNotificationCard invite={invite} />
        ))}
        <br />
        {serviceNotifications.map((notification) =>
          notification.serviceList.map((service) => {
            if (notification.host._id === user?.userId) return null
            return (
              <ServiceNotificationCard
                service={service}
                notification={notification}
                isVendor={notification.host._id === user?.userId}
              />
            )
          }),
        )}
      </div>
    </div>
  )
}

export default Invites

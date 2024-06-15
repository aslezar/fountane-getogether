type Props = {
  disabled?: boolean
  text: string
  onClick: () => void
  icon?: any
  prim?: boolean
  wfull?: boolean
}

const Button = (props: Props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className={`flex items-center gap-1.5 justify-center ${props.wfull && "w-full"} max-w-md bg-dark bg-opacity-90  text-white py-2 px-5 text-base rounded-2xl`}
    >
      <span>{props?.icon}</span>
      <span>{props.text}</span>
    </button>
  )
}

export default Button

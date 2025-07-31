const Tooltip = ({Icon, description, className }: { Icon: React.ElementType, description: string, className: string}) => {
  return (
    <div className="items-center relative group">
      <Icon className={className}/>
        <span className="absolute pointer-events-none opacity-0 group-hover:opacity-100 px-6 py-2 text-sm font-medium text-white bg-[#06070a] backdrop-blur-sm rounded-lg shadow-lg border border-neutral-800/10 transition-all duration-200 ease-in-out whitespace-nowrap z-50 bottom-full -translate-x-[70%] -translate-y-2 mb-2">
          {description}
        <span className="absolute w-2 h-2 bg-[#000000] transform rotate-45 bottom-[-4px] left-1/2 -translate-x-1/3" />
      </span>
    </div>
  );
}

export default Tooltip;


const BasicInput = ({name,value ,onChange}: {
    name:string,
    value:string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
    return (
        <div className="w-full max-w-sm min-w-50">
            <input className="w-full bg-transparent placeholder:text-slate-400
                text-white text-sm border border-slate-200 rounded-md px-3 py-2 
                transition duration-300 ease focus:outline-none focus:border-slate-400
                hover:border-slate-300 shadow-sm focus:shadow" placeholder="Type here..." 
                onChange={onChange}
                name={name}
                value={value}
                />
        </div>
    )
}

export default BasicInput
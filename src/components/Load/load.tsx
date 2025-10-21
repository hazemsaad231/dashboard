import { Rings } from 'react-loader-spinner'
const Load = ()=>{


    return(

        <div className="flex justify-center items-center h-screen">
        <Rings
  visible={true}
  height="80"
  width="80"
  color="#2563eb"
  ariaLabel="rings-loading"
  wrapperStyle={{}}
  wrapperClass=""
  />
</div>
    )
}

export default Load ;
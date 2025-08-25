export function ActivityItem({ dot='green', title, meta }:{ 
  dot?:string; 
  title:React.ReactNode; 
  meta:React.ReactNode 
}){
  return (
    <div>
      <span style={{ background: dot === 'green' ? 'green' : dot === 'blue' ? 'blue' : 'gray' }}></span>
      <div>
        <div>{title}</div>
        <div>{meta}</div>
      </div>
    </div>
  )
}

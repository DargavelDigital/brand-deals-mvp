export default function ActivityItem({ dot='var(--success)', title, meta }:{ 
  dot?:string; 
  title:React.ReactNode; 
  meta:React.ReactNode 
}){
  return (
    <div>
      <span style={{ background: dot }}></span>
      <div>
        <div>{title}</div>
        <div>{meta}</div>
      </div>
    </div>
  )
}

// import './styles.css'
import InputSelector from '../src/components/InputSelector'
import JobScraper from '../src/JobScraper'

export default function NewTabApp() {
  return (
    <JobScraper/>
    // <InputSelector onSubmit={function (data: { companyName: string; jobTitle: string }): Promise<boolean> {
    //   console.log(data)
    // } } className={'w-96'}/>
  )
}

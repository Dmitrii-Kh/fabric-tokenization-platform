
function CompanyName(props) {
    if(sessionStorage.getItem('affiliation') !== 'company') {
        return <span>{props.cn}, </span>
    }
    return <span></span>
}

function ApprovalInfo(props) {
   if(sessionStorage.getItem('affiliation') !== 'investor') {
       return (
           <div className="approval-info">Project approved: <b>{props.approved.toString()}({props.approvedBy || "ValidatorName"})</b></div>
       )
   }
   return <div className="approval-info">Approved by: <b>{props.approvedBy}</b></div>
}

const Project = (props) => {
    const {companyUID, companyName, projectName, projectDescription, totalSupply, supply, tokenName, priceInUSDT, approved, approvedBy} = props;
    return (
        <div className="project" id={projectName}>

            <div className="project-header">
                <h4><CompanyName cn={companyName}/> <em>{projectName}</em></h4>
            </div>
            <div className="project-body">
                <p className="project-description">{projectDescription}</p>
                <div className="project-additional-info">
                    <h4>Total Supply: <b>{totalSupply} {tokenName}</b></h4>
                    <h4>Price: <b>{priceInUSDT} USDT</b></h4>
                </div>
                <div className="project-additional-info">
                    <h4>Supply: <b>{supply || 0} {tokenName}</b></h4>
                    <ApprovalInfo approved={approved} approvedBy = {approvedBy}/>
                </div>

            </div>
            <div className="floating-up-div">
                <a className="more-info-ref" href={`/projects/${companyUID}/${projectName}`}>More info</a>
            </div>
        </div>
    )

}
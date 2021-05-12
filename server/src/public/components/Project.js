function DangerBtn(props) {
    if (sessionStorage.getItem("role") === 'ROLE_ADMIN') {
        return <button className="danger-btn" onClick={async () => {

            try {
                const response = await fetch('/coursesB', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id: props.id})
                });

                // const responseObj = await response.json();
                // if (responseObj.message) {
                //     alert(responseObj.message);
                //     console.log(responseObj.error);
                // } else {
                //     alert('Course successfully deleted!');
                // }
            } catch (e) {
                console.log(e);
            }

        }}>Delete</button>

    } else if (props.userCourse) {

        return <button className="danger-btn" onClick={async(e) => {
            e.preventDefault();

            const courseId = props.id;
            const userId = sessionStorage.getItem("userId");
            try {
                const response = await fetch('/checkOut', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({courseId: courseId, userId: userId})
                });

                console.log(response.text())
                // const responseObj = await JSON.parse(response);
                // if (responseObj.message) {
                //     alert(responseObj.message);
                //     console.log(responseObj.error);
                // } else {
                //     alert('Successfully unenrolled!');
                // }
            } catch (er) {
                console.log(er);
            }

        }}>Unenroll</button>
    }

    return <div/>
}

function CompanyName(props) {
    if(sessionStorage.getItem('affiliation') !== 'company') {
        return <span>{props.cn}, </span>
    }
    return <span></span>
}

function ApprovalInfo(props) {
   if(sessionStorage.getItem('affiliation') !== 'investor') {
       return (
           <div className="approval-info">Project approved: <b>{props.approved.toString()}</b></div>
       )
   }
}

const Project = (props) => {
    const {companyName, projectName, projectDescription, emission, supply, tokenName, priceInUSDT, approved} = props;
    return (
        <div className="project" id={projectName}>

            <div className="project-header">
                <h4><CompanyName cn={companyName}/> <em>{projectName}</em></h4>
            </div>
            <div className="project-body">
                <p className="project-description">{projectDescription}</p>
                <div className="project-additional-info">
                    <h4>Total Supply: <b>{emission} {tokenName}</b></h4>
                    <h4>Price: <b>{priceInUSDT} USDT</b></h4>
                </div>
                <div className="project-additional-info">
                    <h4>Supply: <b>{supply || 0} {tokenName}</b></h4>
                    <ApprovalInfo approved={approved}/>
                </div>

            </div>
            <div className="floating-up-div">
                <a className="more-info-ref" href={`/projects/${companyName}/${projectName}`}>More info</a>
            </div>
        </div>
    )

}
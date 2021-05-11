

class ValidatorDetailed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validatorFullName: undefined
        };

    }

    handleChange(val) {
        this.setState({validatorFullName: val});
    }


    componentDidMount() {
        this.handleChange(window.location.href.split('/')[5]);
    }


    render() {
        if (this.state.validatorFullName) {
            return (
                <div className="validator-detailed-container">
                   <ApprovedProjects
                       validatorFullName = { this.state.validatorFullName }
                   />
                </div>
            );
        } else {
            return <div>Please wait</div>;
        }
    }
}


ReactDOM.render(<ValidatorDetailed/>, document.getElementsByClassName('main-section')[0]);

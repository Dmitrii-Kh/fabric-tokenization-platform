

class ValidatorDetailed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            validatorUID: undefined
        };

    }

    handleChange(val) {
        this.setState({validatorUID: val});
    }


    componentDidMount() {
        this.handleChange(window.location.href.split('/')[5]);
    }


    render() {
        if (this.state.validatorUID) {
            return (
                <div className="validator-detailed-container">
                   <ApprovedProjects
                       validatorUID = { this.state.validatorUID }
                   />
                </div>
            );
        } else {
            return <div data-text="Please&nbsp;wait..." className="please-wait">Please&nbsp;wait...</div>;
        }
    }
}


ReactDOM.render(<ValidatorDetailed/>, document.getElementsByClassName('main-section')[0]);

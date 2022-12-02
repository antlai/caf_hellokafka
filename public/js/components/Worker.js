'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

class Worker extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'counterId', bsSize: 'large'},
                     cE(rB.Col, {sm:2, xs: 12},
                        cE(rB.ControlLabel, null, 'Processed')
                       ),
                      cE(rB.Col, {sm:4, xs: 12},
                         cE(rB.FormControl, {
                             type: 'text',
                             readOnly: true,
                             value: this.props.processed
                         })
                        )
                    )
                 );
    }
}

module.exports = Worker;

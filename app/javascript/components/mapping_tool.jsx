import React, {Fragment} from "react"
import PropTypes from "prop-types"
import { connect } from 'react-redux'

import { Modal } from 'react-bootstrap';


import {matchSelection, unmatch, selectExpectedOption, selectObservedOption, toggleMapping, saveTab } from '../actions'

let matchedFields = {}

const MODAL_ID = 'myModal'
const FORM_FIELD_SELECT_ID = 'form-fields'
const CSV_SELECT_ID = 'fields-from-csv'
const MAPPING_TABLE_ID = 'matched-fields-table'
const DATA_TABLES = 'div.tab-pane table.dataTable';

// Match the fields selected in the required and CSV selects
function matchFields(schema) {
  var selectedformField = $('#' + FORM_FIELD_SELECT_ID + ' :selected').val()
  var selectedFieldFromCSV = $('#' + CSV_SELECT_ID + ' :selected').val()

  // Check that both fields have been selected
  if (selectedformField && selectedFieldFromCSV) {
    // Add the new match
    matchedFields[selectedformField] = selectedFieldFromCSV

    // Add match to table and remove fields from the selects
    addRowToMatchedTable(schema, selectedformField, selectedFieldFromCSV)
    removeFieldsFromSelects(selectedformField, selectedFieldFromCSV)
  } else {
    alert("Please select a required field and a field from the CSV.")
  }
}

// Unmatch fields and add them back to the selects
function unmatchFields(schema, row) {
  // Extract the data from the row
  var formField = row.children()[1].innerHTML;
  var fieldFromCSV = row.children()[2].innerHTML;

  // Add fields back to the selects
  addFieldToSelect(FORM_FIELD_SELECT_ID, formField, schema.properties[formField].friendly_name + ' (' + formField + ')', schema.properties[formField].required);
  addFieldToSelect(CSV_SELECT_ID, fieldFromCSV, fieldFromCSV, false);

  // Remove the property
  delete matchedFields[formField];
}


// Adds the required and CSV field to the matched table
function addRowToMatchedTable(schema, formField, csvField) {
  $('#' + MAPPING_TABLE_ID + ' > tbody:last-child')
    .append($('<tr>')
      .append(
        $('<td>').text(schema.properties[formField].friendly_name),
        $('<td>').text(formField),
        $('<td>').text(csvField),
        $('<td>').append(
          $('<button>').attr({
            type: 'button',
            class: 'btn btn-danger',
          }).text('x')
            .click(function() {
              var row = $(this).parent().parent();
              unmatchFields(schema, row);

              // Remove the table row
              row.remove();
            })
        )
      )
    );
}

// Remove the matched fields from the selects to prevent users from selecting them again
function removeFieldsFromSelects(formField, csvField) {
  $("#" + FORM_FIELD_SELECT_ID + " option[value='" + formField + "']").remove();
  $("#" + CSV_SELECT_ID + " option[value='" + csvField + "']").remove();
}


const MappingHeaderComponent = (props) => {
  return (
    <Modal.Header>
      <button type="button" className="close" onClick={props.onClickClose}
        data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
      </button>
      <Modal.Title>Select CSV mappings</Modal.Title>
    </Modal.Header>
    )
}

const MappingHeader = connect((status) => {return {}}, (dispatch) => {
  return {
    onClickClose: () => {
      dispatch(toggleMapping(false))
    }
  }
})(MappingHeaderComponent)



const MappingFooterComponent = (props) => {
 return(
  <Modal.Footer>
    <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
    <button id="complete-csv-matching" type="button" className="btn btn-primary"
      onClick={ () => { props.onAccept() } }
      disabled={!props.valid}  >Accept</button>
  </Modal.Footer>
  )
}

const MappingFooter = connect((state) => { return{} }, (dispatch) => {
  return {onAccept: () => { dispatch(toggleMapping(false))} }
})(MappingFooterComponent)

const mappingOption = (text, value, pos, required, onClick) => {
  return(<option key={pos} value={value} onClick={() => {onClick(value)}}>{required ? '*':''}{text}</option>)
}

const ExpectedMappingOptions = (props) => {
  return(props.expected.map((key, pos) => {
    return mappingOption(props.schema.properties[key].friendly_name, key, pos, props.schema.properties[key].required, props.onSelectExpectedOption)
  }))
}

const ObservedMappingOptions = (props) => {
  return(props.observed.map((key, pos) => {
    return mappingOption(key, key, pos, false, props.onSelectObservedOption)
  }))
}

const MappingInterface = (props) => {
  return (
    <div className="row">
      <div className="col-md-5">
        <div className="form-group">
          <label htmlFor="form-fields">Fields on Form</label>
          <select id="form-fields" className="form-control" name="form-fields" size="8" defaultValue={props.selectedExpected||""}>
            <ExpectedMappingOptions {...props} />
          </select>
        </div>
      </div>
      <div className="col-md-5">
        <div className="form-group">
          <label htmlFor="fields-from-csv">Fields from CSV</label>
          <select id="fields-from-csv" className="form-control" name="fields-from-csv" size="8" defaultValue={props.selectedObserved||""}>
            <ObservedMappingOptions {...props} />
          </select>
        </div>
      </div>
      <div className="col-md-2">
        <div className="form-group">
          <button id="match-fields-button" type="button" className="btn btn-primary"
          disabled={(!props.selectedExpected || !props.selectedObserved)}
          onClick={ () => { props.onMatchFields(props.selectedExpected, props.selectedObserved) }}>Match</button>
        </div>
      </div>
    </div>

    )
}

const MappedPair = (pairInfo, schema, onUnmatch, number) => {
  return(
    <tr key={number.toString()}>
      <td>{ schema.properties[pairInfo.expected].friendly_name }</td>
      <td>{ pairInfo.expected }</td>
      <td>{ pairInfo.observed }</td>
      <td><button className='btn btn-danger' onClick={() => {onUnmatch(pairInfo.expected, pairInfo.observed)}}>x</button></td>
    </tr>)
}

const MappedPairs = (props) => {
  return(props.matched.map((pair, pos) => { return MappedPair(pair, props.schema, props.onUnmatch, pos) }))
}

const MappedFieldsList = (props) => {
  return (
    <Fragment>
      <h5>Matched fields</h5>
      <table id="matched-fields-table" className="table">
        <thead>
          <tr>
            <th></th>
            <th>Available field</th>
            <th>Field from CSV</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <MappedPairs {...props} />
        </tbody>
      </table>
    </Fragment>
  )
}

const MappingBody = (props) => {
  return (
    <Modal.Body>
      <div id="modal-alert-required" className="alert alert-error" role="alert" style={{ display: 'none' }}>
        All the required fields must be mapped to a CSV field.
      </div>
      <div id="modal-alert-ignored" className="alert alert-warning" role="alert" style={{ display: 'none'}}>
        Some fields from the CSV have been ignored, please confirm that the correct matches have been made.
      </div>
      <p>
        Please select a form field on the left and the CSV field on the right, then press the "Match"
        button to map them. Fields marked with a * must be mapped.
      </p>

      <MappingInterface {...props }/>
      <MappedFieldsList {...props } />
    </Modal.Body>
    )
}

class MappingToolComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentDidUpdate(){
    if (this.props && this.props.valid) {
      if (this.props.content &&  this.props.schema && this.props.schema.properties) {
        //CSVFieldChecker.fillInTableFromFile(buildContentFromStructured(this.props.content.structured), buildMatchedFields(this.props.matched), $(DATA_TABLES), this.props.schema.properties)
      }
    }

    //$(this.modal).on('hidden.bs.modal', this.props.handleHideModal);
  }

  render () {
    if (this.props.shown) {
      return(
          <Modal.Dialog backdrop={"true"}>
            <MappingHeader />
            <MappingBody {...this.props} />
            <MappingFooter {...this.props} />
          </Modal.Dialog>
      )
    }
    return null
  }
}

const mapStateToProps = (state) => {

  return {
    selectedObserved: state?.mapping?.selectedObserved || null,
    selectedExpected: state?.mapping?.selectedExpected || null,
    content: state?.content || {},
    expected: state?.mapping?.expected || [],
    observed: state?.mapping?.observed || [],
    matched: state?.mapping?.matched || [],
    shown: (typeof state?.mapping?.shown !=='undefined') ? state.mapping.shown : !!state?.mapping?.hasUnmatched,
    valid: !!state?.mapping?.valid,
    schema: state?.schema || null
  }
};

const buildMatchedFields = (matched) => {
  return matched.reduce((memo, obj) => {
    memo[obj.expected] = obj.observed
    return memo
  }, {})
}

const reduceAndProcess = (obj, process) => {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = process(obj, key)
    return memo
  }, {})
}

const buildContentFromStructured = (structured) => {
  return reduceAndProcess(structured.labwares, (memo, labId) => {
    return reduceAndProcess(structured.labwares[labId].addresses, (memo, address) => {
      return reduceAndProcess(structured.labwares[labId].addresses[address].fields, (memo, field) => {
        return structured.labwares[labId].addresses[address].fields[field].value
      })
    })
  })
}


const mapDispatchToProps = (dispatch, { match, location }) => {
  return {
    onSelectExpectedOption: (value) => {
      dispatch(selectExpectedOption(value))
    },
    onSelectObservedOption: (value) => {
      dispatch(selectObservedOption(value))
    },
    onMatchFields: (expected, observed) => {
      dispatch(matchSelection(expected, observed))
      dispatch(saveTab())
      //dispatch(updateState())
    },
    onUnmatch: (expected, observed) => {
      dispatch(unmatch(expected, observed))
      dispatch(saveTab())
      //dispatch(updateState())
    }
  }
}


let MappingTool = connect(mapStateToProps, mapDispatchToProps)(MappingToolComponent)
export default MappingTool

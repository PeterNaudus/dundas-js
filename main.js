export Enrich;

console.log('Dundas-JS version: 0.01')

function Table(dundas_table_obj) {
  /*
   * Helper functions for tables
   */
  this.dundas_table_obj = dundas_table_obj
  this.get_selected = function(column_name) {
    /*
     * Get selected rows and return the values of the specified column
     */
    
    // Create all the cells for the rows that are selected
	cells = this.dundas_table_obj.getSelectedRowHierarchyMembers();
    values = Array();
    
    cells.forEach(function (cell) {
      // We have to iterate through each cell to filter out the IP addresses
      // ... as a side note, if we want to know what row each cells belongs to,
      // ... check the rowTupleOrdinal property
      if (cell._levelUniqueName == column_name) {
        values.push(cell._caption);
      }
  	})
    
    return values;
  }
}

function Enrich(dundas_table_obj, dundas_label_obj) {
  /*
   * Performs enrichments. Results will be written to $dundas_table_obj
   */
  this.dundas_table_obj = dundas_table_obj
  this.dundas_label_obj = dundas_label_obj
  this.cloud_function = 'https://us-central1-expel-engineering-lab.cloudfunctions.net/Enrich';
  this.templates = {
    'loading': 'Please wait ...',
    'error': '<strong>Please select one or more rows before pressing the "Enrich data" button</strong>',
    'output': '<div style="height:200px; overflow: scroll;"><pre>{{content}}</pre></div>'
  }

  this.enrich = function() {
    this.dundas_label_obj.labelText = this.templates.loading;

    table_obj = Table(this.dundas_table_obj);
    ip_addresses = Table(this.dundas_table_obj).get_selected('source_ip');
    
    if (ip_addresses.length == 0) {
  	  this.dundas_label_obj.labelText = this.templates.error;
      return;
    }
    
    // Send the request to our Enrich cloud function
    $.post(
      this.cloud_function,
      JSON.stringify({"ips": ip_addresses}),
      function(result) {
        // Now build the HTML output
        this.dundas_label_obj.labelText = this.templates.output.replace(/{{content}}/ig, result.IPs.join('\n'));
      }
    )
  }
}

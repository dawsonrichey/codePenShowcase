var languageConfig = // Renamed from 'idioma' for clarity
            {
                "sProcessing":     "Processing...",
                "sLengthMenu":     "Display _MENU_ records",
                "sZeroRecords":    "No matching records found", // Standard English text
                "sEmptyTable":     "No data available in table", // Standard English text
                "sInfo":           "Showing _START_ to _END_ of _TOTAL_ entries", // Standard English text
                "sInfoEmpty":      "Showing 0 to 0 of 0 entries", // Standard English text
                "sInfoFiltered":   "(filtered from _MAX_ total entries)", // Standard English text
                "sInfoPostFix":    "",
                "sSearch":         "Search:",
                "sUrl":            "",
                "sInfoThousands":  ",",
                "sLoadingRecords": "Loading...",
                "oPaginate": {
                    "sFirst":    "First",
                    "sLast":     "Last",
                    "sNext":     "Next", // Standard English text
                    "sPrevious": "Previous" // Standard English text
                },
                "oAria": {
                    "sSortAscending":  ": activate to sort column ascending", // Standard English text
                    "sSortDescending": ": activate to sort column descending" // Standard English text
                },
                "buttons": {
                    "copyTitle": 'Copy to clipboard', // Standard English text
                    "copyKeys": 'Press ctrl or u2318 + C to copy the table data to your system clipboard.<br><br>To cancel, click this message or press escape.', // Standard English text
                    "copySuccess": {
                        "_": 'Copied %d rows to clipboard', // Standard English text
                        "1": 'Copied 1 row to clipboard' // Standard English text
                    },

                    "pageLength": {
                    "_": "Show %d entries", // Standard English text
                    "-1": "Show all entries" // Standard English text
                    }
                }
            };

// Global variable to hold the DataTable instance
var dataTableInstance = null;
var currentFileName = 'tableData.csv'; // Default initial file

// --- NEW: Function to generate column toggles ---
function generateColumnToggles() {
    if (!dataTableInstance) return; // Exit if table not initialized

    const toggleContainer = $('#toggle-buttons-container');
    toggleContainer.empty(); // Clear previous toggles

    dataTableInstance.columns().every(function () {
        const column = this;
        const columnIndex = column.index();
        // Get header text robustly (handles potential HTML in header)
        const headerText = $(column.header()).text() || `Column ${columnIndex + 1}`; // Fallback title
        const isVisible = column.visible();

        // Create a toggle button (using <a> for link-like appearance)
        const toggleButton = $('<a></a>', {
            'class': 'col-toggle-btn ' + (isVisible ? 'active' : 'inactive'),
            'href': '#', // Prevent page jump
            'data-column-index': columnIndex,
            'text': headerText,
            'title': `Click to ${isVisible ? 'hide' : 'show'} "${headerText}" column`
        });

        // --- Attach Click Handler ---
        toggleButton.on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior

            const index = $(this).data('column-index');
            const col = dataTableInstance.column(index);

            // Toggle visibility
            col.visible(!col.visible());

            // Update button appearance
            $(this).toggleClass('active inactive');
            $(this).attr('title', `Click to ${col.visible() ? 'hide' : 'show'} "${headerText}" column`);

            // Optional: Adjust table layout if columns change width significantly
            // dataTableInstance.columns.adjust().draw(false);
        });

        toggleContainer.append(toggleButton);
    });
     if (toggleContainer.is(':empty')) {
         toggleContainer.html('<span class="text-muted">No columns found.</span>');
     }
}

// Function to initialize or update DataTable
function initializeOrUpdateDataTable(csvData, fileName) {
    console.log("Initializing/Updating DataTable with:", fileName);
    $('#current-csv-filename').text(fileName || 'N/A'); // Update display

    // Define columns based on CSV headers
    const columns = csvData.meta.fields ? csvData.meta.fields.map(field => ({ data: field, title: field })) : [];
    console.log("Columns defined:", columns);

    // If DataTable instance exists, destroy it first
    if ($.fn.dataTable.isDataTable('#mainTable')) {
        console.log("Destroying existing DataTable instance.");
        dataTableInstance.destroy();
        // Crucially, empty the thead as well if columns might change
        $('#mainTable thead').empty();
        // Also empty tbody, just in case
         $('#mainTable tbody').empty();
    }

    // --- DataTables Configuration ---
    dataTableInstance = $('#mainTable').DataTable( {

        "language": languageConfig, // Use the updated config object
        "lengthMenu": [[15,30,50, -1],[15,30,50,"Show All"]], // Updated "Display All"
        dom: 'Bfrt<"col-md-6 inline"i> <"col-md-6 inline"p>',

        // --- Data Source Configuration ---
        "data": csvData.data, // Use the parsed data rows
        "columns": columns, // Use dynamically generated columns
        "destroy": true, // Good practice if re-initializing often

        // --- Buttons Configuration (Keep your existing button setup) ---
        buttons: {
            dom: {
                container: {
                    tag: 'div',
                    className: 'flexcontent'
                },
                buttonLiner: {
                    tag: null
                }
            },
            buttons: [


                    {
                        extend:    'copyHtml5',
                        text:      '<i class="fa fa-clipboard"></i>Copy',
                        title:'Table Copy', // Kept original English title
                        titleAttr: 'Copy',
                        className: 'btn btn-app export',
                        exportOptions: {
                            columns: ':visible' // Export only visible columns by default
                        }
                    },

                    {
                        extend:    'pdfHtml5',
                        text:      '<i class="fa fa-file-pdf-o"></i>PDF',
                        title:'Table Title in PDF', // Translated title
                        titleAttr: 'PDF',
                        className: 'btn btn-app export pdf',
                        exportOptions: {
                            columns: ':visible' // Example: Export only visible columns
                            // Or specify indices: columns: [ 0, 1 ]
                        },
                        customize:function(doc) {

                            doc.styles.title = {
                                color: '#4c8aa0',
                                fontSize: '30',
                                alignment: 'center'
                            }
                            // Example: Style the second column (index 1)
                            // doc.styles['td:nth-child(2)'] = { 
                            //     width: '100px',
                            //     'max-width': '100px'
                            // }
                            doc.styles.tableHeader = {
                                fillColor:'#4c8aa0',
                                color:'white',
                                alignment:'center'
                            }
                            // Adjust content margins if needed
                            // doc.content[1].margin = [ 100, 0, 100, 0 ]

                        }

                    },

                    {
                        extend:    'excelHtml5',
                        text:      '<i class="fa fa-file-excel-o"></i>Excel',
                        title:'Table Title in Excel', // Translated title
                        titleAttr: 'Excel',
                        className: 'btn btn-app export excel',
                        exportOptions: {
                            columns: ':visible'
                            // Or specify indices: columns: [ 0, 1 ]
                        },
                    },
                    {
                        extend:    'csvHtml5',
                        text:      '<i class="fa fa-file-text-o"></i>CSV',
                        title:'Table Title in CSV', // Translated title
                        titleAttr: 'CSV',
                        className: 'btn btn-app export csv',
                        exportOptions: {
                            columns: ':visible'
                            // Or specify indices: columns: [ 0, 1, 2, 3 ]
                        }
                    },
                    {
                        extend:    'print',
                        text:      '<i class="fa fa-print"></i>Print',
                        title:'Table', // Kept original English title
                        titleAttr: 'Print',
                        className: 'btn btn-app export imprimir',
                        exportOptions: {
                            columns: ':visible'
                            // Or specify indices: columns: [ 0, 1 ]
                        }
                    },
                    {
                        extend:    'pageLength',
                        titleAttr: 'Show entries', // Translated title attribute
                        className: 'selectTable'
                    }
                ]
        },

        // --- NEW: Callback after table is drawn ---
        "drawCallback": function( settings ) {
            console.log("Table draw complete, generating toggles...");
            // Generate toggles *after* the table structure (including headers) is drawn
            generateColumnToggles();
        },
        // Also generate toggles on initial init complete
        "initComplete": function(settings, json) {
             console.log("Table init complete, generating toggles...");
             generateColumnToggles();
        }

    });
    console.log("DataTable initialization/update complete.");
}

// Function to load and process CSV
function loadAndProcessCSV(fileSource, isFileUpload = false) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvText = e.target.result;
        console.log("CSV content loaded, parsing...");
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                if (results.errors.length > 0) {
                    console.error("Errors parsing CSV:", results.errors);
                    alert(`Error parsing CSV file "${currentFileName}". Check console for details.`);
                    // Clear toggles on error
                    $('#toggle-buttons-container').html('<span class="text-danger">Error loading columns.</span>');
                } else {
                    console.log("CSV Parsed Successfully:", results);
                    // Clear toggles before initializing/updating table - they will be regenerated by callbacks
                    $('#toggle-buttons-container').html('<span class="text-muted">Generating toggles...</span>');
                    initializeOrUpdateDataTable(results, currentFileName); // Initialize/Update DataTable
                }
                 // Reset file input to allow re-uploading the same file
                 if (isFileUpload) {
                    $('#csv-upload-input').val(null);
                 }
            },
            error: function (error) {
                console.error("PapaParse Error:", error);
                alert(`Failed to parse CSV file "${currentFileName}".`);
                 $('#current-csv-filename').text("Error Loading File");
                 if (isFileUpload) {
                    $('#csv-upload-input').val(null);
                 }
            }
        });
    };

    reader.onerror = function (e) {
        console.error("FileReader Error:", e);
        alert(`Failed to read file "${currentFileName}".`);
         $('#current-csv-filename').text("Error Reading File");
         if (isFileUpload) {
             $('#csv-upload-input').val(null);
         }
    };

    if (isFileUpload && fileSource instanceof File) {
        currentFileName = fileSource.name; // Update global filename
        console.log(`Reading file from upload: ${currentFileName}`);
        reader.readAsText(fileSource); // Read the uploaded file object
    } else if (typeof fileSource === 'string') {
        currentFileName = fileSource; // Update global filename (for initial load)
        console.log(`Fetching file from path: ${currentFileName}`);
        fetch(fileSource) // Fetch the file by path (for initial load)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText} for ${fileSource}`);
                }
                return response.text();
            })
            .then(text => {
                // Simulate the FileReader result for PapaParse consistency
                reader.onload({ target: { result: text } });
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                alert(`Failed to fetch initial CSV file "${currentFileName}". Please ensure it exists.`);
                $('#current-csv-filename').text("Failed to Fetch");
                // Initialize with empty data on fetch failure
                initializeOrUpdateDataTable({ data: [], meta: { fields: [] } }, "Fetch Failed");
            });
    } else {
         console.error("Invalid file source provided to loadAndProcessCSV");
         alert("Cannot load CSV: Invalid source.");
    }
}

// --- Main Execution ---
$(document).ready(function() {
    // Initial Load
    loadAndProcessCSV(currentFileName); // Load the default file

    // Setup File Upload Listener
    $('#csv-upload-input').on('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            console.log("File selected via upload:", file.name);
            if (file.type === "text/csv" || file.name.toLowerCase().endsWith('.csv')) {
                 loadAndProcessCSV(file, true); // Process the uploaded file
            } else {
                 alert("Please select a CSV file.");
            }
        }
    });
});
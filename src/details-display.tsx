

export function DetailsDisplay({documentObject}: {documentObject: any}) {
    const orderedKeys = ["id", "name", "description", "tags", "published"];
  
    return (
      <div className="w-64 p-1`">
        <p className="text-base">Details:</p>
        <div className="w-full shadow m-1">
          <DocumentDetails doc={documentObject} order={orderedKeys} />
        </div>
      </div>
    )
}
  
function DocumentDetails({doc, order}: {doc: any, order: string[]}) {
  return (
    <div>
      {Object.entries(doc)
      .sort(([keyA], [keyB]) => {
        const indexA = order.indexOf(keyA);
        const indexB = order.indexOf(keyB);

        if (indexA === -1 && indexB === -1) {
          return keyA.localeCompare(keyB);
        } else if (indexA === -1) {
          return 1;
        } else if (indexB === -1) {
          return -1;
        } else {
          return indexA - indexB;
        }
      })
      .map(([key, value]: [key: string, value: any]) => {
        let displayValue;
  
        if (typeof value === 'string') {
            displayValue = value;
        } else if (Array.isArray(value)) {
            if (value.every(item => typeof item === 'string')) {
                displayValue = value.join(', ');
            } else {
                displayValue = value.length;
            }
        } else if (typeof value === 'boolean') {
            displayValue = value ? 'true' : 'false';
        } else if (typeof value === 'undefined') {
            displayValue = 'None';
        } else {
            displayValue = 'Complex object';
        }
  
        return (
          <div key={key} className="text-sm truncate">
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {displayValue}
          </div>
        );  })}
    </div>
  )
}
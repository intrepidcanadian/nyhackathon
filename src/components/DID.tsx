import React, { useState } from "react"; // Import React and useState
import jsonData from "./../scripts/proofofAddress.json";
import Image from 'next/image';



function DID() {

  
  return (
    
    <>
      <div className="section">
        <div>
        <strong>Generated JSON Data:</strong>
        <pre>
          {JSON.stringify(jsonData, null, 2)}
        </pre>
        </div>
      </div>
   
    </>
  );
}

export default DID;

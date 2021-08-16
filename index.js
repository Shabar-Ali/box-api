var BoxSDK = require('box-node-sdk');

// Initialize the SDK with your app credentials
var sdk = new BoxSDK({
clientID: 'CLIENT_ID',
clientSecret: 'CLIENT_SECRET'
});

// Create a basic API client, which does not automatically refresh the access token
var client = sdk.getBasicClient('DEVELOPERS TOKEN');

const destinationFolderId = ''

async function copyFile(fileId, fileName, folderName){
    try{
        let response = await client.files.copy(fileId, destinationFolderId, {name: fileName.substr(0, fileName.length-4)+' - '+folderName+'.pdf'});
    }
    catch(err){
        console.log(err);
        console.log("error")
        console.log(fileId, fileName, folderName);
    };
    return;
}

async function main(){
    try{
        const rootFolderId = '';
        let rootFolderResponse = await client.folders.get(rootFolderId, {limit: 5000});
        
        let parentFolders = rootFolderResponse.item_collection.entries;
        const totalLoans = rootFolderResponse.item_collection.total_count;
        
        let loansDone = 0;
        let appraisalDocsCopied = 0;
        for(folder of parentFolders){
            let id = folder.id;
            let folderName = folder.name;
            
            let parentFolderResponse = await client.folders.get(id, {limit: 5000});
            let childFolderList = parentFolderResponse.item_collection.entries;
            
            for(f of childFolderList){
                let name = f.name.toLowerCase();
                if(name.includes('appraisal') && !name.includes('notice') && !name.includes('acknowledgement')){
                    
                    let child_folder_id = f.id;
                    let childFolderResponse = await client.folders.get(child_folder_id);
                    let appraisalList = childFolderResponse.item_collection.entries;
                    
                    for(appraisal of appraisalList){
                        let fileId = appraisal.id;
                        let fileName = appraisal.name;
                        let fileType = appraisal.type;
                        if(fileType === 'file' && fileName.toLowerCase().includes('appraisal') && !name.includes('notice') && !name.includes('acknowledgement')){
                            await copyFile(fileId, fileName, folderName); 
                            appraisalDocsCopied++;
                        }
                    }
                }
            }
            loansDone++;
            console.log(`loans done ${loansDone}/${totalLoans}`);
        }
        console.log(`Total Appraisal Copies = ${appraisalDocsCopied}`);
    }catch(err){
        console.log(error);
    }
    
}

main();

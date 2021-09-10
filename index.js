fs = require('fs');
var BoxSDK = require('box-node-sdk');

// Initialize the SDK with your app credentials
var sdk = new BoxSDK({
clientID: '',
clientSecret: ''
});

// Create a basic API client, which does not automatically refresh the access token
var client = sdk.getBasicClient('');

const destinationFolderId = '';

// const rootFolderId = '';
// const rootFolderId = '';
const rootFolderId = '';

const requiredFile = ''.toLowerCase()
const requiredFolder = ''.toLowerCase()

async function copyFile(fileId, fileName, folderName){
    try{
        let response = await client.files.copy(fileId, destinationFolderId, {name: fileName.substr(0, fileName.length-4)+' ** '+folderName+'.pdf'});
        console.log("copied");
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
        
        let rootFolderResponse = await client.folders.get(rootFolderId, {limit: 5000});
        
        let loanFolders = rootFolderResponse.item_collection.entries;
        const totalLoans = rootFolderResponse.item_collection.total_count;
        
        let loansDone = 0;
        let docsCopied = 0;
        let i = 0;

        for(folder of loanFolders){
            if(i < 0){
                i++;
                loansDone++;
            }
            else{
                
                let id = folder.id;
                let folderName = folder.name;
                
                let parentFolderResponse = await client.folders.get(id, {limit: 5000});
                let childFolderList = parentFolderResponse.item_collection.entries;
                
                for(f of childFolderList){
                    let name = f.name.toLowerCase();
                    if(name.includes(requiredFolder)){
                        
                        let child_folder_id = f.id;
                        let childFolderResponse = await client.folders.get(child_folder_id);
                        let requiredFileList = childFolderResponse.item_collection.entries;
                        
                        for(file of requiredFileList){
                            // console.log("file: ", file.name)
                            let fileId = file.id;
                            let fileName = file.name;
                            let fileType = file.type;
                            if(fileType === 'file' && (fileName.toLowerCase().includes(requiredFile))){
                                await copyFile(fileId, fileName, folderName); 
                                docsCopied++;
                                if(docsCopied === 50)   break;
                            }
                        }
                    }
                    if(docsCopied === 50)   break;
                }
                if(docsCopied === 50)   break;
                loansDone++;
                console.log(`loans done ${loansDone}/${totalLoans}`);
            }
        }
    console.log(`Total DOCS Copied = ${docsCopied}`);
    }catch(err){
        console.log(err);
    }
    
}



main();







// deleteFiles()


// client.files.content('847084975631').then((res) => {
//     console.log(res)
// })



async function deleteFiles(){
    try {
        let i = 0;
        let rootFolderResponse = await client.folders.get(rootFolderId, {limit: 10000, offset: 1000});
        let files = rootFolderResponse.item_collection.entries;
        let count = 0;
        for(f of files){
            let fileInfo = await client.files.get(f.id);
            if(fileInfo.size < 1000000){
                console.log(fileInfo.size, fileInfo.id);
                await client.files.delete(fileInfo.id);
                count++;
            }
            i++;
            if(i%100 == 0)  console.log(i)
        }
        console.log("files deleted"+count)
    } catch (error) {
        console.log(error);
        console.log("error");
    }
}




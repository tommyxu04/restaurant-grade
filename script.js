const API="https://data.cityofnewyork.us/resource/43nn-pn8j.json";

function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}
function formatDate(d){if(!d)return"";const dt=new Date(d);return dt.toISOString().split("T")[0];}

async function search(){
  const name=document.getElementById("name").value.trim();
  const boro=document.getElementById("boro").value.trim();
  const status=document.getElementById("status");
  const out=document.getElementById("results");
  out.innerHTML="";
  if(!name){status.textContent="Enter a restaurant name.";status.className="error";return;}
  status.textContent="Searching…";status.className="muted";

  let where=`upper(dba) like '%25${name.toUpperCase()}%25'`;
  if(boro) where+=` AND boro='${boro}'`;

  const url=API+`?$where=${where}&$order=grade_date DESC&$limit=1000`;

  try{
    const res=await fetch(url);
    if(!res.ok) throw new Error(res.status);
    const data=await res.json();
    if(!data.length){status.textContent="No results found";return;}

    // Keep only most recent record per restaurant (camis)
    const latest={};
    for(const r of data){
      if(!r.camis) continue;
      const existing=latest[r.camis];
      const date=new Date(r.grade_date||r.inspection_date||0);
      if(!existing || date>new Date(existing.grade_date||existing.inspection_date||0)){
        latest[r.camis]=r;
      }
    }

    const unique=Object.values(latest);
    status.textContent=`Found ${unique.length} restaurant(s) with latest grades.`;

    const tbl=document.createElement("table");
    tbl.innerHTML="<tr><th>Name</th><th>Address</th><th>Borough</th><th>Grade</th><th>Score</th><th>Grade Date</th></tr>";
    for(const r of unique){
      const row=document.createElement("tr");
      const grade=(r.grade||"—").toUpperCase();
      row.innerHTML=`
        <td style="width: 30%">${esc(r.dba||"")}</td>
        <td style="width: 30%">${esc([r.building,r.street,r.zipcode].filter(Boolean).join(" "))}</td>
        <td style="width: 12%">${esc(r.boro||"")}</td>
        <td style="width: 7%" class="grade-${grade}">${esc(grade)}</td>
        <td style="width: 7%">${esc(r.score||"")}</td>
        <td style="width: 14%">${esc(formatDate(r.grade_date||r.inspection_date))}</td>`;
      tbl.appendChild(row);
    }
    out.appendChild(tbl);

  }catch(e){
    console.error(e);
    status.textContent="Error fetching data: "+e;
    status.className="error";
  }
}

document.getElementById("search").onclick=search;
document.getElementById("name").addEventListener("keydown",e=>{if(e.key==="Enter")search();});

<?php

// Check for filename parameter
if ($argc!=2)
  exit(1);

// Check file exists
if (!file_exists($argv[1]))
  exit(1);

// Parse the XML file
$xml=new SimpleXMLElement(file_get_contents($argv[1]));

// Extract width and height
$width=intval((string)$xml->attributes()['width']);
$height=intval((string)$xml->attributes()['height']);

// Process level properties
foreach ($xml->properties->property as $prop)
{
  switch ($prop->attributes()->name)
  {
    case "desc":
      $description=(string)$prop->attributes()->value;
      break;

    case "title":
      $title=(string)$prop->attributes()->value;
      break;

    case "doors":
      $doors=(string)$prop->attributes()->value;
      break;

    default:
      break;
  }
}

// Initialise level data
$leveldata=[];

// Process the tile layers
foreach ($xml->layer as $layer)
{
  // Remove whitespace and split CSV into array
  $data=preg_replace('/\s+/', '', $layer->data[0]);
  $seq=explode(",", $data);

  // Determine which layer we are on, and therefore which modifier offset to use
  if ($layer->attributes()->name=="tiles") $modifier=0;
  if ($layer->attributes()->name=="chars") $modifier=256;

  // Iterate tiles array for this layer
  for ($i=0; $i<count($seq); $i++)
  {
    // Parse tileid for current position
    $val=intval($seq[$i]);
    // If it is not empty, add the modifier offset
    if ($val!=0) $val+=$modifier;

    // Update the output level data
    $leveldata[$i]=(isset($leveldata[$i])?$leveldata[$i]:0)+$val;
  }
}

// Set up result object
$output=array(
  "width"=>$width,
  "height"=>$height,
  "title"=>$title,
  "desc"=>$description,
  "level"=>$leveldata
);

// Add optional door property (if required)
if (isset($doors))
  $output["doors"]=$doors;

// Encode output to JSON
echo json_encode($output);

?>

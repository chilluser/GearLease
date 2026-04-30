<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model {
  use HasFactory;
  protected $fillable = ['conversation_id','user_id','text','type','rent_listing_id','rent_days','rent_total'];

  public function conversation()
  {
      return $this->belongsTo(Conversation::class);
  }

  public function user()
  {
      return $this->belongsTo(User::class);
  }

}
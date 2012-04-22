'''
Created on Mar 4, 2012

@author: Geoffrey
'''
from entity import Entity
from broadcast import Broadcast

class Creature(Entity):
    dbo_fields = Entity.dbo_fields
    
    current_target = None
    
    def die(self):
        self.exit_msg = Broadcast(s="{n} expires, permanently.", color=0xE6282D)
        self.leave_env()
        self.detach()
        del self          